using NzbDrone.Core.Download.Pending;
using NzbDrone.Core.Download.TrackedDownloads;
using NzbDrone.Core.Messaging.Events;

namespace NzbDrone.Core.Queue
{
    public interface IQueueStatusService
    {
        QueueStatusSnapshot GetSnapshot();
    }

    public class QueueStatusService : IQueueStatusService,
                                      IHandle<QueueUpdatedEvent>,
                                      IHandle<PendingReleasesUpdatedEvent>
    {
        private readonly IQueueService _queueService;
        private readonly IPendingReleaseService _pendingReleaseService;
        private QueueStatusSnapshot _snapshot;

        public QueueStatusService(IQueueService queueService, IPendingReleaseService pendingReleaseService)
        {
            _queueService = queueService;
            _pendingReleaseService = pendingReleaseService;
        }

        public QueueStatusSnapshot GetSnapshot()
        {
            return _snapshot ?? Refresh();
        }

        public void Handle(QueueUpdatedEvent message)
        {
            Refresh();
        }

        public void Handle(PendingReleasesUpdatedEvent message)
        {
            Refresh();
        }

        private QueueStatusSnapshot Refresh()
        {
            var queue = _queueService.GetQueue();
            var pendingCount = _pendingReleaseService.GetPendingQueueCount();

            var snapshot = new QueueStatusSnapshot();
            var knownCount = 0;
            var unknownCount = 0;

            foreach (var item in queue)
            {
                if (item.Series != null)
                {
                    knownCount++;

                    if (item.TrackedDownloadStatus == TrackedDownloadStatus.Error)
                    {
                        snapshot.Errors = true;
                    }

                    if (item.TrackedDownloadStatus == TrackedDownloadStatus.Warning)
                    {
                        snapshot.Warnings = true;
                    }
                }
                else
                {
                    unknownCount++;

                    if (item.TrackedDownloadStatus == TrackedDownloadStatus.Error)
                    {
                        snapshot.UnknownErrors = true;
                    }

                    if (item.TrackedDownloadStatus == TrackedDownloadStatus.Warning)
                    {
                        snapshot.UnknownWarnings = true;
                    }
                }
            }

            snapshot.TotalCount = queue.Count + pendingCount;
            snapshot.Count = knownCount + pendingCount;
            snapshot.UnknownCount = unknownCount;

            _snapshot = snapshot;

            return snapshot;
        }
    }
}
