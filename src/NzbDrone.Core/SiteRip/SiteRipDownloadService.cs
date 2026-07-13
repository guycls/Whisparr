using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using NLog;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.Download;
using NzbDrone.Core.Download.Clients;
using NzbDrone.Core.Download.Clients.QBittorrent;
using NzbDrone.Core.Exceptions;
using NzbDrone.Core.History;
using NzbDrone.Core.Indexers;
using NzbDrone.Core.Messaging.Events;
using NzbDrone.Core.Parser.Model;
using NzbDrone.Core.Tv;

namespace NzbDrone.Core.SiteRip
{
    public interface ISiteRipDownloadService
    {
        Task Grab(RemoteEpisode remoteEpisode, int seriesId, List<SiteRipGrabSelection> selections);
        QBittorrent GetQBittorrentClient();
    }

    public class SiteRipDownloadService : ISiteRipDownloadService
    {
        private readonly IDownloadClientFactory _downloadClientFactory;
        private readonly IIndexerFactory _indexerFactory;
        private readonly IEpisodeService _episodeService;
        private readonly ISeriesService _seriesService;
        private readonly ISiteRipDownloadRepository _siteRipDownloadRepository;
        private readonly ISiteRipDownloadFileRepository _siteRipDownloadFileRepository;
        private readonly ISiteRipPendingFileService _siteRipPendingFileService;
        private readonly IEventAggregator _eventAggregator;
        private readonly ISeedConfigProvider _seedConfigProvider;
        private readonly Logger _logger;

        public SiteRipDownloadService(IDownloadClientFactory downloadClientFactory,
                                      IIndexerFactory indexerFactory,
                                      IEpisodeService episodeService,
                                      ISeriesService seriesService,
                                      ISiteRipDownloadRepository siteRipDownloadRepository,
                                      ISiteRipDownloadFileRepository siteRipDownloadFileRepository,
                                      ISiteRipPendingFileService siteRipPendingFileService,
                                      IEventAggregator eventAggregator,
                                      ISeedConfigProvider seedConfigProvider,
                                      Logger logger)
        {
            _downloadClientFactory = downloadClientFactory;
            _indexerFactory = indexerFactory;
            _episodeService = episodeService;
            _seriesService = seriesService;
            _siteRipDownloadRepository = siteRipDownloadRepository;
            _siteRipDownloadFileRepository = siteRipDownloadFileRepository;
            _siteRipPendingFileService = siteRipPendingFileService;
            _eventAggregator = eventAggregator;
            _seedConfigProvider = seedConfigProvider;
            _logger = logger;
        }

        public QBittorrent GetQBittorrentClient()
        {
            var client = _downloadClientFactory.GetAvailableProviders()
                .FirstOrDefault(c => c is QBittorrent && c.Definition.Enable) as QBittorrent;

            if (client == null)
            {
                throw new SiteRipException("An enabled qBittorrent download client is required for SiteRIP downloads");
            }

            return client;
        }

        public async Task Grab(RemoteEpisode remoteEpisode, int seriesId, List<SiteRipGrabSelection> selections)
        {
            var qbit = GetQBittorrentClient();
            var series = _seriesService.GetSeries(seriesId);
            var episodeIds = selections.Select(s => s.EpisodeId).Distinct().ToList();
            var episodes = _episodeService.GetEpisodes(episodeIds);
            var wantedIndices = selections.SelectMany(s => s.FileIndices).Distinct().ToList();

            IIndexer indexer = null;
            if (remoteEpisode.Release.IndexerId > 0)
            {
                indexer = _indexerFactory.GetInstance(_indexerFactory.Get(remoteEpisode.Release.IndexerId));
            }

            remoteEpisode.Series = series;
            remoteEpisode.Episodes = episodes;
            remoteEpisode.SeedConfiguration = _seedConfigProvider.GetSeedConfiguration(remoteEpisode);
            remoteEpisode.ReleaseSource = ReleaseSourceType.SiteRip;
            remoteEpisode.ShouldOverride = true;
            remoteEpisode.DownloadAllowed = true;

            var downloadId = await qbit.EnsureSiteRipTorrentAdded(remoteEpisode, indexer);

            var mergedIndices = wantedIndices;
            var existingDownload = _siteRipDownloadRepository.FindByDownloadId(downloadId);

            if (existingDownload != null)
            {
                var existingPending = _siteRipPendingFileService.GetPendingFiles(existingDownload.Id)
                    .Select(f => f.FileIndex)
                    .ToList();

                if (existingPending.Any())
                {
                    mergedIndices = wantedIndices.Union(existingPending).Distinct().ToList();
                    _logger.Debug(
                        "SiteRIP merged file selection: {0} new + {1} existing = {2} wanted",
                        wantedIndices.Count,
                        existingPending.Count,
                        mergedIndices.Count);
                }
            }

            qbit.ApplySiteRipFileSelection(downloadId, mergedIndices);

            var episodeGrabbedEvent = new EpisodeGrabbedEvent(remoteEpisode)
            {
                DownloadClient = qbit.Name,
                DownloadClientId = qbit.Definition.Id,
                DownloadClientName = qbit.Definition.Name,
                DownloadId = downloadId
            };

            _eventAggregator.PublishEvent(episodeGrabbedEvent);

            var siteRipDownload = _siteRipDownloadRepository.FindByDownloadId(downloadId);

            if (siteRipDownload == null)
            {
                siteRipDownload = _siteRipDownloadRepository.Insert(new SiteRipDownload
                {
                    DownloadId = downloadId,
                    SeriesId = seriesId,
                    TorrentTitle = remoteEpisode.Release.Title,
                    DownloadClientId = qbit.Definition.Id
                });
            }

            var existingFiles = _siteRipDownloadFileRepository
                .GetByDownloadId(siteRipDownload.Id)
                .ToDictionary(f => (f.EpisodeId, f.FileIndex));

            foreach (var selection in selections)
            {
                for (var i = 0; i < selection.FileIndices.Count; i++)
                {
                    var fileIndex = selection.FileIndices[i];
                    var filePath = selection.FilePaths?.ElementAtOrDefault(i) ?? string.Empty;
                    var fileKey = (selection.EpisodeId, fileIndex);

                    if (existingFiles.TryGetValue(fileKey, out var existingFile))
                    {
                        var updated = false;

                        if (!filePath.IsNullOrWhiteSpace() && existingFile.FilePath != filePath)
                        {
                            existingFile.FilePath = filePath;
                            updated = true;
                        }

                        if (existingFile.Imported)
                        {
                            existingFile.Imported = false;
                            updated = true;
                        }

                        if (updated)
                        {
                            _siteRipDownloadFileRepository.Update(existingFile);
                        }

                        continue;
                    }

                    _siteRipDownloadFileRepository.Insert(new SiteRipDownloadFile
                    {
                        SiteRipDownloadId = siteRipDownload.Id,
                        EpisodeId = selection.EpisodeId,
                        FileIndex = fileIndex,
                        FilePath = filePath,
                        Imported = false
                    });

                    existingFiles.Add(fileKey, new SiteRipDownloadFile
                    {
                        EpisodeId = selection.EpisodeId,
                        FileIndex = fileIndex
                    });
                }
            }

            _logger.Info("SiteRIP grab queued for {0} scenes from torrent {1}", selections.Count, remoteEpisode.Release.Title);
        }
    }
}
