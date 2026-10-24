using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using NLog;
using NzbDrone.Common.Disk;
using NzbDrone.Common.Extensions;
using NzbDrone.Common.Instrumentation.Extensions;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.Languages;
using NzbDrone.Core.MediaFiles.EpisodeImport;
using NzbDrone.Core.MediaFiles.EpisodeImport.Manual;
using NzbDrone.Core.Messaging.Commands;
using NzbDrone.Core.MetadataSource.ThePornDb;
using NzbDrone.Core.Qualities;
using NzbDrone.Core.Tv;
using NzbDrone.Core.Tv.Commands;

namespace NzbDrone.Core.Notifications.Stash
{
    public interface IStashFullImportService
    {
        StashFullImportResult Import();
    }

    public class StashFullImportService : IStashFullImportService, IExecute<StashFullImportCommand>
    {
        private const int PageSize = 100;

        private readonly INotificationFactory _notificationFactory;
        private readonly IConfigService _configService;
        private readonly ITpdbSceneClient _tpdbSceneClient;
        private readonly StashProxy _stashProxy;
        private readonly IDiskProvider _diskProvider;
        private readonly ISeriesService _seriesService;
        private readonly IEpisodeService _episodeService;
        private readonly IAddSeriesService _addSeriesService;
        private readonly IExecute<RefreshSeriesCommand> _refreshSeries;
        private readonly IExecute<ManualImportCommand> _manualImport;
        private readonly Logger _logger;

        public StashFullImportService(INotificationFactory notificationFactory,
                                      IConfigService configService,
                                      ITpdbSceneClient tpdbSceneClient,
                                      StashProxy stashProxy,
                                      IDiskProvider diskProvider,
                                      ISeriesService seriesService,
                                      IEpisodeService episodeService,
                                      IAddSeriesService addSeriesService,
                                      IExecute<RefreshSeriesCommand> refreshSeries,
                                      IExecute<ManualImportCommand> manualImport,
                                      Logger logger)
        {
            _notificationFactory = notificationFactory;
            _configService = configService;
            _tpdbSceneClient = tpdbSceneClient;
            _stashProxy = stashProxy;
            _diskProvider = diskProvider;
            _seriesService = seriesService;
            _episodeService = episodeService;
            _addSeriesService = addSeriesService;
            _refreshSeries = refreshSeries;
            _manualImport = manualImport;
            _logger = logger;
        }

        public void Execute(StashFullImportCommand message)
        {
            Import();
        }

        public StashFullImportResult Import()
        {
            var result = new StashFullImportResult();

            if (_configService.TpdbApiKey.IsNullOrWhiteSpace())
            {
                _logger.Warn("Stash full import aborted: TPDB API key is not configured");
                return result;
            }

            var settings = GetStashSettings();

            if (settings == null)
            {
                _logger.Warn("Stash full import aborted: no Stash connection found");
                return result;
            }

            _logger.ProgressInfo("Starting full Stash import with {0}", settings.Address);

            List<StashScene> scenes;

            try
            {
                scenes = FetchTpdbScenes(settings);
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Full import: failed to query Stash");
                return result;
            }

            _logger.ProgressInfo("Full import: found {0} Stash scenes with ThePornDB metadata", scenes.Count);

            var studios = new Dictionary<int, Series>();
            var studiosAdded = new HashSet<int>();
            var importedSceneIds = new HashSet<int>();
            var studiosMissingSettings = new HashSet<int>();

            for (var i = 0; i < scenes.Count; i++)
            {
                CommandCancellation.ThrowIfCancelled();
                ProcessScene(settings, scenes[i], i + 1, scenes.Count, studios, studiosAdded, importedSceneIds, studiosMissingSettings, result);
            }

            _logger.ProgressInfo(
                "Full Stash import completed: {0} studios added, {1} imported, {2} skipped, {3} failed",
                result.StudiosAdded,
                result.Imported,
                result.Skipped,
                result.Failed);

            return result;
        }

        private List<StashScene> FetchTpdbScenes(StashSettings settings)
        {
            var scenes = new List<StashScene>();
            var seen = new HashSet<string>(StringComparer.Ordinal);
            var page = 1;

            while (true)
            {
                CommandCancellation.ThrowIfCancelled();

                var batch = _stashProxy.FindTpdbScenes(settings, page, PageSize);
                var batchScenes = batch?.Scenes;

                if (batchScenes == null || batchScenes.Count == 0)
                {
                    break;
                }

                var added = 0;

                foreach (var scene in batchScenes)
                {
                    if (scene?.Id == null || !seen.Add(scene.Id))
                    {
                        continue;
                    }

                    scenes.Add(scene);
                    added++;
                }

                if (added == 0)
                {
                    break;
                }

                if (batch.Count > 0 && scenes.Count >= batch.Count)
                {
                    break;
                }

                if (batchScenes.Count < PageSize)
                {
                    break;
                }

                page++;
            }

            return scenes;
        }

        private void ProcessScene(StashSettings settings, StashScene scene, int index, int total, Dictionary<int, Series> studios, HashSet<int> studiosAdded, HashSet<int> importedSceneIds, HashSet<int> studiosMissingSettings, StashFullImportResult result)
        {
            _logger.ProgressTrace("Full import: scene {0}/{1}", index, total);

            if (scene.Files == null || !scene.Files.Any())
            {
                _logger.Debug("Full import: Stash scene {0} has no files", scene.Id);
                result.Skipped++;
                return;
            }

            var stashId = GetTpdbStashId(scene);

            if (stashId.IsNullOrWhiteSpace())
            {
                _logger.Debug("Full import: Stash scene {0} has no ThePornDB stash id", scene.Id);
                result.Skipped++;
                return;
            }

            TpdbSceneReference reference;

            try
            {
                reference = _tpdbSceneClient.GetSceneByUuid(stashId);
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Full import: failed to resolve Stash scene {0} ({1})", scene.Id, stashId);
                result.Failed++;
                return;
            }

            if (reference == null || reference.SceneId <= 0 || reference.SiteId <= 0)
            {
                _logger.Debug("Full import: ThePornDB did not resolve Stash scene {0} ({1})", scene.Id, stashId);
                result.Skipped++;
                return;
            }

            if (importedSceneIds.Contains(reference.SceneId))
            {
                _logger.Debug("Full import: scene {0} was already imported in this run", reference.SceneId);
                result.Skipped++;
                return;
            }

            ImportScene(
                settings,
                new StashSceneCandidate
                {
                    SceneId = reference.SceneId,
                    SiteId = reference.SiteId,
                    Title = reference.Title,
                    Files = scene.Files
                },
                studios,
                studiosAdded,
                importedSceneIds,
                studiosMissingSettings,
                result);
        }

        private void ImportScene(StashSettings settings, StashSceneCandidate scene, Dictionary<int, Series> studios, HashSet<int> studiosAdded, HashSet<int> importedSceneIds, HashSet<int> studiosMissingSettings, StashFullImportResult result)
        {
            if (studiosMissingSettings.Contains(scene.SiteId))
            {
                result.Failed++;
                return;
            }

            var addedStudio = false;

            if (!studios.TryGetValue(scene.SiteId, out var series))
            {
                try
                {
                    series = _seriesService.FindByTvdbId(scene.SiteId);
                }
                catch (Exception ex)
                {
                    _logger.Error(ex, "Full import: failed to look up studio {0}", scene.SiteId);
                    result.Failed++;
                    return;
                }
            }

            if (series == null)
            {
                if (settings.FullImportRootFolder.IsNullOrWhiteSpace() || settings.FullImportQualityProfileId <= 0)
                {
                    _logger.Warn("Full import: studio {0} is not in Whisparr and the Stash full import root folder or quality profile is not set", scene.SiteId);
                    studiosMissingSettings.Add(scene.SiteId);
                    result.Failed++;
                    return;
                }

                try
                {
                    series = _addSeriesService.AddSeries(new Series
                    {
                        TvdbId = scene.SiteId,
                        Title = scene.Title.IsNotNullOrWhiteSpace() ? scene.Title : $"Site {scene.SiteId}",
                        Monitored = true,
                        MonitorNewItems = NewItemMonitorTypes.None,
                        RootFolderPath = settings.FullImportRootFolder,
                        QualityProfileId = settings.FullImportQualityProfileId,
                        AddOptions = new AddSeriesOptions
                        {
                            SearchForMissingEpisodes = false,
                            SearchForCutoffUnmetEpisodes = false,
                            Monitor = MonitorTypes.Existing,
                            EpisodesToMonitor = new List<int> { scene.SceneId }
                        }
                    });

                    if (series == null)
                    {
                        _logger.Warn("Full import: studio {0} was not added", scene.SiteId);
                        result.Failed++;
                        return;
                    }

                    result.StudiosAdded++;
                    addedStudio = true;
                    studiosAdded.Add(scene.SiteId);
                    studios[scene.SiteId] = series;
                    _logger.Info("Full import: added studio {0} ({1})", series.Title, scene.SiteId);
                }
                catch (Exception ex)
                {
                    _logger.Error(ex, "Full import: failed to add studio {0}", scene.SiteId);
                    result.Failed++;
                    return;
                }
            }
            else
            {
                studios[scene.SiteId] = series;
            }

            Episode episode = null;

            if (!addedStudio)
            {
                try
                {
                    episode = FindEpisode(series.Id, scene.SceneId);
                }
                catch (Exception ex)
                {
                    _logger.Error(ex, "Full import: failed to load scenes for studio {0}", series.Title);
                    result.Failed++;
                    return;
                }
            }

            if (addedStudio || episode == null)
            {
                try
                {
                    _logger.ProgressInfo("Full import: refreshing studio {0}", series.Title);
                    _refreshSeries.Execute(new RefreshSeriesCommand(new List<int> { series.Id }, addedStudio));
                    series = _seriesService.GetSeries(series.Id) ?? series;
                    studios[scene.SiteId] = series;
                }
                catch (Exception ex)
                {
                    _logger.Error(ex, "Full import: failed to refresh studio {0}", series.Title);
                    result.Failed++;
                    return;
                }

                try
                {
                    episode = FindEpisode(series.Id, scene.SceneId);
                }
                catch (Exception ex)
                {
                    _logger.Error(ex, "Full import: failed to load scenes for studio {0}", series.Title);
                    result.Failed++;
                    return;
                }
            }

            if (episode == null)
            {
                _logger.Debug("Full import: studio {0} has no scene {1} after refresh", scene.SiteId, scene.SceneId);
                result.Failed++;
                return;
            }

            if (episode.EpisodeFileId > 0)
            {
                _logger.Debug("Full import: scene {0} already has a file", scene.SceneId);
                result.Skipped++;
                return;
            }

            var filePath = SelectBestFilePath(settings, scene.Files, series.Path);

            if (filePath.IsNullOrWhiteSpace())
            {
                _logger.Debug("Full import: no accessible file on disk for scene {0}", scene.SceneId);
                result.Skipped++;
                return;
            }

            if (studiosAdded.Contains(scene.SiteId) && !episode.Monitored)
            {
                _episodeService.SetEpisodeMonitored(episode.Id, true);
            }

            _logger.Info("Full import: importing scene {0} from {1}", scene.SceneId, filePath);

            try
            {
                _manualImport.Execute(new ManualImportCommand
                {
                    Files = new List<ManualImportFile>
                    {
                        new ManualImportFile
                        {
                            Path = filePath,
                            FolderName = new DirectoryInfo(filePath).Name,
                            SeriesId = series.Id,
                            EpisodeIds = new List<int> { episode.Id },
                            Quality = new QualityModel(Quality.Unknown),
                            Languages = new List<Language> { Language.Unknown }
                        }
                    },
                    ImportMode = ImportMode.Auto
                });

                importedSceneIds.Add(scene.SceneId);
                result.Imported++;
                _logger.ProgressInfo("Full import: imported scene {0} for {1}", scene.SceneId, series.Title);
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Full import: failed to import scene {0} for {1}", scene.SceneId, series.Title);
                result.Failed++;
            }
        }

        private Episode FindEpisode(int seriesId, int sceneId)
        {
            var episodes = _episodeService.GetEpisodeBySeries(seriesId) ?? new List<Episode>();
            return episodes.FirstOrDefault(e => e.TvdbId == sceneId);
        }

        private StashSettings GetStashSettings()
        {
            var definition = _notificationFactory.All()
                .FirstOrDefault(n => n.Implementation.Equals("Stash", StringComparison.InvariantCultureIgnoreCase));

            if (definition?.Settings is not StashSettings settings || !settings.IsValid)
            {
                return null;
            }

            return settings;
        }

        private static string GetTpdbStashId(StashScene scene)
        {
            return scene?.StashIds?
                .FirstOrDefault(id => StashProxy.TpdbEndpoint.Equals(id.Endpoint, StringComparison.OrdinalIgnoreCase))
                ?.StashId;
        }

        private string SelectBestFilePath(StashSettings settings, List<StashSceneFile> files, string seriesPath)
        {
            var existingPaths = files
                .Select(f => StashPathMapper.MapFromStashPath(settings, f.Path, _logger))
                .Where(p => _diskProvider.FileExists(p))
                .ToList();

            if (!existingPaths.Any())
            {
                return null;
            }

            var underSeries = existingPaths.FirstOrDefault(p => seriesPath.IsParentPath(p));

            if (underSeries != null)
            {
                return underSeries;
            }

            return existingPaths
                .OrderByDescending(p => _diskProvider.GetFileSize(p))
                .First();
        }

        private class StashSceneCandidate
        {
            public int SceneId { get; set; }
            public int SiteId { get; set; }
            public string Title { get; set; }
            public List<StashSceneFile> Files { get; set; }
        }
    }
}
