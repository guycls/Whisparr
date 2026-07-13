using System;
using System.Linq;
using NLog;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.Download.TrackedDownloads;
using NzbDrone.Core.History;
using NzbDrone.Core.Messaging.Events;
using NzbDrone.Core.SiteRip;

namespace NzbDrone.Core.Download
{
    public class DownloadEventHub : IHandle<DownloadFailedEvent>,
                                    IHandle<DownloadCompletedEvent>,
                                    IHandle<DownloadCanBeRemovedEvent>
    {
        private readonly IConfigService _configService;
        private readonly IProvideDownloadClient _downloadClientProvider;
        private readonly ISiteRipDownloadRepository _siteRipDownloadRepository;
        private readonly ISiteRipPendingFileService _siteRipPendingFileService;
        private readonly IHistoryService _historyService;
        private readonly Logger _logger;

        public DownloadEventHub(IConfigService configService,
            IProvideDownloadClient downloadClientProvider,
            ISiteRipDownloadRepository siteRipDownloadRepository,
            ISiteRipPendingFileService siteRipPendingFileService,
            IHistoryService historyService,
            Logger logger)
        {
            _configService = configService;
            _downloadClientProvider = downloadClientProvider;
            _siteRipDownloadRepository = siteRipDownloadRepository;
            _siteRipPendingFileService = siteRipPendingFileService;
            _historyService = historyService;
            _logger = logger;
        }

        public void Handle(DownloadFailedEvent message)
        {
            var trackedDownload = message.TrackedDownload;

            if (trackedDownload == null ||
                message.TrackedDownload.DownloadItem.Removed ||
                !trackedDownload.DownloadItem.CanBeRemoved)
            {
                return;
            }

            if (HasRemainingSiteRipScenes(message.DownloadId))
            {
                return;
            }

            var downloadClient = _downloadClientProvider.Get(message.TrackedDownload.DownloadClient);
            var definition = downloadClient.Definition as DownloadClientDefinition;

            if (!definition.RemoveFailedDownloads)
            {
                return;
            }

            RemoveFromDownloadClient(trackedDownload, downloadClient);
        }

        public void Handle(DownloadCompletedEvent message)
        {
            var trackedDownload = message.TrackedDownload;
            var downloadClient = _downloadClientProvider.Get(trackedDownload.DownloadClient);
            var definition = downloadClient.Definition as DownloadClientDefinition;

            MarkItemAsImported(trackedDownload, downloadClient);

            if (trackedDownload.DownloadItem.Removed ||
                !trackedDownload.DownloadItem.CanBeRemoved ||
                trackedDownload.DownloadItem.Status == DownloadItemStatus.Downloading)
            {
                return;
            }

            if (!definition.RemoveCompletedDownloads)
            {
                return;
            }

            RemoveFromDownloadClient(message.TrackedDownload, downloadClient);
        }

        public void Handle(DownloadCanBeRemovedEvent message)
        {
            var trackedDownload = message.TrackedDownload;
            var downloadClient = _downloadClientProvider.Get(trackedDownload.DownloadClient);
            var definition = downloadClient.Definition as DownloadClientDefinition;

            if (trackedDownload.DownloadItem.Removed ||
                !trackedDownload.DownloadItem.CanBeRemoved ||
                !definition.RemoveCompletedDownloads)
            {
                return;
            }

            RemoveFromDownloadClient(message.TrackedDownload, downloadClient);
        }

        private void RemoveFromDownloadClient(TrackedDownload trackedDownload, IDownloadClient downloadClient)
        {
            try
            {
                _logger.Debug("[{0}] Removing download from {1} history", trackedDownload.DownloadItem.Title, trackedDownload.DownloadItem.DownloadClientInfo.Name);
                downloadClient.RemoveItem(trackedDownload.DownloadItem, true);
                trackedDownload.DownloadItem.Removed = true;
            }
            catch (NotSupportedException)
            {
                _logger.Warn("Removing item not supported by your download client ({0}).", downloadClient.Definition.Name);
            }
            catch (Exception e)
            {
                _logger.Error(e, "Couldn't remove item {0} from client {1}", trackedDownload.DownloadItem.Title, downloadClient.Name);
            }
        }

        private void MarkItemAsImported(TrackedDownload trackedDownload, IDownloadClient downloadClient)
        {
            try
            {
                _logger.Debug("[{0}] Marking download as imported from {1}", trackedDownload.DownloadItem.Title, trackedDownload.DownloadItem.DownloadClientInfo.Name);
                downloadClient.MarkItemAsImported(trackedDownload.DownloadItem);
            }
            catch (NotSupportedException e)
            {
                _logger.Debug(e.Message);
            }
            catch (Exception e)
            {
                _logger.Error(e, "Couldn't mark item {0} as imported from client {1}", trackedDownload.DownloadItem.Title, downloadClient.Name);
            }
        }

        private bool HasRemainingSiteRipScenes(string downloadId)
        {
            var siteRipDownload = _siteRipDownloadRepository.FindByDownloadId(downloadId);

            if (siteRipDownload == null)
            {
                return false;
            }

            if (_siteRipPendingFileService.HasPendingFiles(siteRipDownload.Id))
            {
                return true;
            }

            return _historyService.Find(downloadId, EpisodeHistoryEventType.Grabbed).Any();
        }
    }
}
