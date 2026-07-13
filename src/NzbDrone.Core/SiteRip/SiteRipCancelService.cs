using System;
using System.Collections.Generic;
using System.Linq;
using NLog;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.Download;
using NzbDrone.Core.Download.Clients;
using NzbDrone.Core.Download.Clients.QBittorrent;
using NzbDrone.Core.Download.TrackedDownloads;
using NzbDrone.Core.History;
using NzbDrone.Core.Messaging.Commands;
using NzbDrone.Core.Messaging.Events;
using NzbDrone.Core.Parser.Model;

namespace NzbDrone.Core.SiteRip
{
    public class SiteRipCancelOptions
    {
        public bool RemoveFromClient { get; set; }
        public bool Blocklist { get; set; }
        public bool SkipRedownload { get; set; }
        public bool ChangeCategory { get; set; }
        public TrackedDownload TrackedDownload { get; set; }
    }

    public class SiteRipCancelResult
    {
        public bool TorrentRemoved { get; set; }
        public bool HasRemainingScenes { get; set; }
    }

    public interface ISiteRipCancelService
    {
        SiteRipCancelResult CancelEpisodes(string downloadId, IReadOnlyCollection<int> episodeIds, SiteRipCancelOptions options);
    }

    public class SiteRipCancelService : ISiteRipCancelService
    {
        private readonly ISiteRipDownloadRepository _siteRipDownloadRepository;
        private readonly ISiteRipDownloadFileRepository _siteRipDownloadFileRepository;
        private readonly IHistoryService _historyService;
        private readonly IDownloadClientFactory _downloadClientFactory;
        private readonly IProvideDownloadClient _downloadClientProvider;
        private readonly ITrackedDownloadService _trackedDownloadService;
        private readonly IEventAggregator _eventAggregator;
        private readonly IManageCommandQueue _manageCommandQueue;
        private readonly Logger _logger;

        public SiteRipCancelService(ISiteRipDownloadRepository siteRipDownloadRepository,
                                    ISiteRipDownloadFileRepository siteRipDownloadFileRepository,
                                    IHistoryService historyService,
                                    IDownloadClientFactory downloadClientFactory,
                                    IProvideDownloadClient downloadClientProvider,
                                    ITrackedDownloadService trackedDownloadService,
                                    IEventAggregator eventAggregator,
                                    IManageCommandQueue manageCommandQueue,
                                    Logger logger)
        {
            _siteRipDownloadRepository = siteRipDownloadRepository;
            _siteRipDownloadFileRepository = siteRipDownloadFileRepository;
            _historyService = historyService;
            _downloadClientFactory = downloadClientFactory;
            _downloadClientProvider = downloadClientProvider;
            _trackedDownloadService = trackedDownloadService;
            _eventAggregator = eventAggregator;
            _manageCommandQueue = manageCommandQueue;
            _logger = logger;
        }

        public SiteRipCancelResult CancelEpisodes(string downloadId, IReadOnlyCollection<int> episodeIds, SiteRipCancelOptions options)
        {
            var siteRipDownload = _siteRipDownloadRepository.FindByDownloadId(downloadId);

            if (siteRipDownload == null)
            {
                return new SiteRipCancelResult { TorrentRemoved = false, HasRemainingScenes = false };
            }

            var episodeIdList = episodeIds.Distinct().ToList();
            var grabbedHistory = _historyService.Find(downloadId, EpisodeHistoryEventType.Grabbed);
            var remainingEpisodeIds = grabbedHistory
                .Select(h => h.EpisodeId)
                .Distinct()
                .Except(episodeIdList)
                .ToList();
            var hasRemainingScenes = remainingEpisodeIds.Any();

            var cancelledFileIndices = _siteRipDownloadFileRepository
                .GetFileIndicesByEpisodes(siteRipDownload.Id, episodeIdList);

            var cancelledGrabbedHistory = grabbedHistory
                .Where(h => episodeIdList.Contains(h.EpisodeId))
                .ToList();

            _siteRipDownloadFileRepository.DeleteForEpisodes(siteRipDownload.Id, episodeIdList);
            _historyService.DeleteGrabbed(downloadId, episodeIdList);

            var qbit = _downloadClientFactory.GetAvailableProviders()
                .FirstOrDefault(c => c.Definition.Id == siteRipDownload.DownloadClientId) as QBittorrent;

            if (qbit != null && cancelledFileIndices.Any())
            {
                qbit.UnwantSiteRipFileIndices(downloadId, cancelledFileIndices);
            }
            else if (cancelledFileIndices.Empty())
            {
                _logger.Warn(
                    "SiteRIP cancel for torrent {0} had no file indices for episode(s) [{1}]; other scenes may remain active in the client",
                    downloadId,
                    string.Join(", ", episodeIdList));
            }

            var torrentRemoved = false;

            if (!hasRemainingScenes)
            {
                if (options.RemoveFromClient && options.TrackedDownload != null)
                {
                    var downloadClient = _downloadClientProvider.Get(options.TrackedDownload.DownloadClient);

                    if (downloadClient != null)
                    {
                        downloadClient.RemoveItem(options.TrackedDownload.DownloadItem, true);
                    }
                }

                if (!_siteRipDownloadFileRepository.GetByDownloadId(siteRipDownload.Id).Any())
                {
                    _siteRipDownloadRepository.Delete(siteRipDownload.Id);
                }

                torrentRemoved = options.RemoveFromClient;
            }

            _trackedDownloadService.RemoveEpisodes(downloadId, episodeIdList);

            PublishRemovalEvents(cancelledGrabbedHistory, episodeIdList, hasRemainingScenes, options);

            _manageCommandQueue.Push(new RefreshMonitoredDownloadsCommand(), CommandPriority.High);

            _logger.Info(
                "SiteRIP cancelled {0} scene(s) from torrent {1}; {2} scene(s) still active; unwanted {3} file(s)",
                episodeIdList.Count,
                downloadId,
                remainingEpisodeIds.Count,
                cancelledFileIndices.Count);

            return new SiteRipCancelResult
            {
                TorrentRemoved = torrentRemoved,
                HasRemainingScenes = hasRemainingScenes
            };
        }

        private void PublishRemovalEvents(List<EpisodeHistory> grabbedHistory,
                                          List<int> episodeIds,
                                          bool hasRemainingScenes,
                                          SiteRipCancelOptions options)
        {
            if (options.Blocklist && grabbedHistory.Any())
            {
                foreach (var history in grabbedHistory)
                {
                    PublishDownloadFailedEvent(history, new List<int> { history.EpisodeId }, hasRemainingScenes ? null : options.TrackedDownload, options.SkipRedownload);
                }

                return;
            }

            if (!options.RemoveFromClient && !options.Blocklist && !options.ChangeCategory && options.TrackedDownload != null)
            {
                var series = options.TrackedDownload.RemoteEpisode?.Series;

                if (series == null)
                {
                    return;
                }

                var ignoredEvent = new DownloadIgnoredEvent
                {
                    SeriesId = series.Id,
                    EpisodeIds = episodeIds,
                    Languages = options.TrackedDownload.RemoteEpisode.Languages,
                    Quality = options.TrackedDownload.RemoteEpisode.ParsedEpisodeInfo?.Quality,
                    SourceTitle = options.TrackedDownload.DownloadItem.Title,
                    DownloadClientInfo = options.TrackedDownload.DownloadItem.DownloadClientInfo,
                    DownloadId = options.TrackedDownload.DownloadItem.DownloadId,
                    TrackedDownload = hasRemainingScenes ? null : options.TrackedDownload,
                    Message = "Manually ignored"
                };

                _eventAggregator.PublishEvent(ignoredEvent);
            }
        }

        private void PublishDownloadFailedEvent(EpisodeHistory historyItem,
                                                List<int> episodeIds,
                                                TrackedDownload trackedDownload,
                                                bool skipRedownload)
        {
            Enum.TryParse(historyItem.Data.GetValueOrDefault(EpisodeHistory.RELEASE_SOURCE, ReleaseSourceType.Unknown.ToString()), out ReleaseSourceType releaseSource);

            var downloadFailedEvent = new DownloadFailedEvent
            {
                SeriesId = historyItem.SeriesId,
                EpisodeIds = episodeIds,
                Quality = historyItem.Quality,
                SourceTitle = historyItem.SourceTitle,
                DownloadClient = historyItem.Data.GetValueOrDefault(EpisodeHistory.DOWNLOAD_CLIENT),
                DownloadId = historyItem.DownloadId,
                Message = "Manually marked as failed",
                Data = historyItem.Data,
                TrackedDownload = trackedDownload,
                Languages = historyItem.Languages,
                SkipRedownload = skipRedownload,
                ReleaseSource = releaseSource,
            };

            _eventAggregator.PublishEvent(downloadFailedEvent);
        }
    }
}
