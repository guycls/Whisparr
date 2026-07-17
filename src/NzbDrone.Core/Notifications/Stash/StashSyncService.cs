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
using NzbDrone.Core.MediaFiles;
using NzbDrone.Core.MediaFiles.EpisodeImport;
using NzbDrone.Core.MediaFiles.EpisodeImport.Manual;
using NzbDrone.Core.Messaging.Commands;
using NzbDrone.Core.MetadataSource.ThePornDb;
using NzbDrone.Core.Qualities;
using NzbDrone.Core.Tv;

namespace NzbDrone.Core.Notifications.Stash
{
    public interface IStashSyncService
    {
        StashSyncResult Sync(int? notificationId);
    }

    public class StashSyncService : IStashSyncService, IExecute<StashSyncCommand>
    {
        private readonly INotificationFactory _notificationFactory;
        private readonly IEpisodeRepository _episodeRepository;
        private readonly ISeriesService _seriesService;
        private readonly IMediaFileService _mediaFileService;
        private readonly ITpdbSceneClient _tpdbSceneClient;
        private readonly IConfigService _configService;
        private readonly StashProxy _stashProxy;
        private readonly IDiskProvider _diskProvider;
        private readonly ManualImportService _manualImportService;
        private readonly Logger _logger;

        public StashSyncService(INotificationFactory notificationFactory,
                                IEpisodeRepository episodeRepository,
                                ISeriesService seriesService,
                                IMediaFileService mediaFileService,
                                ITpdbSceneClient tpdbSceneClient,
                                IConfigService configService,
                                StashProxy stashProxy,
                                IDiskProvider diskProvider,
                                ManualImportService manualImportService,
                                Logger logger)
        {
            _notificationFactory = notificationFactory;
            _episodeRepository = episodeRepository;
            _seriesService = seriesService;
            _mediaFileService = mediaFileService;
            _tpdbSceneClient = tpdbSceneClient;
            _configService = configService;
            _stashProxy = stashProxy;
            _diskProvider = diskProvider;
            _manualImportService = manualImportService;
            _logger = logger;
        }

        public void Execute(StashSyncCommand message)
        {
            Sync(message.NotificationId);
        }

        public StashSyncResult Sync(int? notificationId)
        {
            var result = new StashSyncResult();

            if (_configService.TpdbApiKey.IsNullOrWhiteSpace())
            {
                _logger.Warn("Stash sync aborted: TPDB API key is not configured");
                return result;
            }

            var settings = GetStashSettings(notificationId);

            if (settings == null)
            {
                _logger.Warn("Stash sync aborted: no Stash connection found");
                return result;
            }

            _logger.ProgressInfo("Starting Stash sync with {0}", settings.Address);

            ImportFromStash(settings, result);
            ScanUntrackedFiles(settings, result);

            _logger.ProgressInfo(
                "Stash sync completed: {0} imported, {1} scanned, {2} skipped, {3} failed",
                result.Imported,
                result.Scanned,
                result.Skipped,
                result.Failed);

            return result;
        }

        private StashSettings GetStashSettings(int? notificationId)
        {
            NotificationDefinition definition;

            if (notificationId.HasValue)
            {
                definition = _notificationFactory.Get(notificationId.Value);

                if (definition == null || !definition.Implementation.Equals("Stash", StringComparison.InvariantCultureIgnoreCase))
                {
                    return null;
                }
            }
            else
            {
                definition = _notificationFactory.All()
                    .FirstOrDefault(n => n.Implementation.Equals("Stash", StringComparison.InvariantCultureIgnoreCase));
            }

            if (definition == null)
            {
                return null;
            }

            var settings = definition.Settings as StashSettings;

            if (settings == null || !settings.IsValid)
            {
                return null;
            }

            return settings;
        }

        private void ImportFromStash(StashSettings settings, StashSyncResult result)
        {
            var episodes = _episodeRepository.All()
                .Where(e => e.Monitored && e.EpisodeFileId == 0 && e.TvdbId > 0)
                .ToList();

            _logger.ProgressInfo("Import phase: checking {0} monitored scenes without files", episodes.Count);

            var importFiles = new List<ManualImportFile>();
            var phaseSkipped = 0;
            var phaseFailed = 0;

            for (var i = 0; i < episodes.Count; i++)
            {
                var episode = episodes[i];

                _logger.ProgressTrace("Import phase: checking scene {0}/{1} (TPDB {2})", i + 1, episodes.Count, episode.TvdbId);

                try
                {
                    var stashId = _tpdbSceneClient.GetSceneUuid(episode.TvdbId);

                    if (stashId.IsNullOrWhiteSpace())
                    {
                        _logger.Debug("Import phase: no TPDB match for episode {0} (TPDB {1})", episode.Id, episode.TvdbId);
                        phaseSkipped++;
                        continue;
                    }

                    var stashScene = _stashProxy.FindSceneByStashId(settings, stashId);

                    if (stashScene?.Files == null || !stashScene.Files.Any())
                    {
                        _logger.Debug("Import phase: Stash has no files for episode {0} (TPDB {1}, Stash ID {2})", episode.Id, episode.TvdbId, stashId);
                        phaseSkipped++;
                        continue;
                    }

                    var series = _seriesService.GetSeries(episode.SeriesId);
                    var filePath = SelectBestFilePath(settings, stashScene.Files, series.Path);

                    if (filePath.IsNullOrWhiteSpace())
                    {
                        _logger.Debug("Import phase: no accessible file on disk for episode {0} (TPDB {1})", episode.Id, episode.TvdbId);
                        phaseSkipped++;
                        continue;
                    }

                    _logger.Info("Import phase: matched episode {0} (TPDB {1}) to file {2}", episode.Id, episode.TvdbId, filePath);

                    importFiles.Add(new ManualImportFile
                    {
                        Path = filePath,
                        FolderName = new DirectoryInfo(filePath).Name,
                        SeriesId = episode.SeriesId,
                        EpisodeIds = new List<int> { episode.Id },
                        Quality = new QualityModel(Quality.Unknown),
                        Languages = new List<Language> { Language.Unknown }
                    });
                }
                catch (Exception ex)
                {
                    _logger.Error(ex, "Import phase: failed to lookup Stash scene for episode {0} (TPDB {1})", episode.Id, episode.TvdbId);
                    phaseFailed++;
                }
            }

            result.Skipped += phaseSkipped;
            result.Failed += phaseFailed;

            _logger.ProgressInfo("Import phase: {0} matched, {1} skipped, {2} failed", importFiles.Count, phaseSkipped, phaseFailed);

            if (importFiles.Any())
            {
                _logger.ProgressInfo("Import phase: importing {0} files", importFiles.Count);

                try
                {
                    _manualImportService.Execute(new ManualImportCommand
                    {
                        Files = importFiles,
                        ImportMode = ImportMode.Auto
                    });

                    result.Imported += importFiles.Count;
                    _logger.ProgressInfo("Import phase: successfully imported {0} files", importFiles.Count);
                }
                catch (Exception ex)
                {
                    _logger.Error(ex, "Import phase: failed to import {0} files from Stash", importFiles.Count);
                    result.Failed += importFiles.Count;
                }
            }
        }

        private void ScanUntrackedFiles(StashSettings settings, StashSyncResult result)
        {
            var episodes = _episodeRepository.All()
                .Where(e => e.EpisodeFileId > 0)
                .ToList();

            _logger.ProgressInfo("Scan phase: checking {0} scenes with files against Stash", episodes.Count);

            var pathsToScan = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var phaseSkipped = 0;
            var phaseFailed = 0;

            for (var i = 0; i < episodes.Count; i++)
            {
                var episode = episodes[i];

                _logger.ProgressTrace("Scan phase: checking scene {0}/{1} (episode {2})", i + 1, episodes.Count, episode.Id);

                try
                {
                    var episodeFile = _mediaFileService.Get(episode.EpisodeFileId);
                    var series = _seriesService.GetSeries(episode.SeriesId);
                    var whisparrPath = Path.Combine(series.Path, episodeFile.RelativePath);
                    var stashPath = StashPathMapper.MapToStashPath(settings, whisparrPath, _logger);

                    if (_stashProxy.IsPathTracked(settings, stashPath))
                    {
                        _logger.Debug("Scan phase: path already tracked in Stash for episode {0}: {1}", episode.Id, stashPath);
                        phaseSkipped++;
                        continue;
                    }

                    _logger.Info("Scan phase: path not tracked in Stash for episode {0}, queuing scan: {1}", episode.Id, stashPath);
                    pathsToScan.Add(stashPath);
                }
                catch (Exception ex)
                {
                    _logger.Error(ex, "Scan phase: failed to check Stash tracking for episode {0}", episode.Id);
                    phaseFailed++;
                }
            }

            result.Skipped += phaseSkipped;
            result.Failed += phaseFailed;

            _logger.ProgressInfo("Scan phase: {0} paths queued, {1} already tracked, {2} failed", pathsToScan.Count, phaseSkipped, phaseFailed);

            var scanIndex = 0;

            foreach (var path in pathsToScan)
            {
                scanIndex++;

                try
                {
                    _logger.ProgressTrace("Scan phase: triggering Stash scan {0}/{1} for {2}", scanIndex, pathsToScan.Count, path);
                    _stashProxy.Update(settings, path);
                    result.Scanned++;
                }
                catch (Exception ex)
                {
                    _logger.Error(ex, "Scan phase: failed to trigger Stash scan for path {0}", path);
                    result.Failed++;
                }
            }

            if (pathsToScan.Any())
            {
                _logger.ProgressInfo("Scan phase: triggered {0} Stash scans", result.Scanned);
            }
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
    }
}
