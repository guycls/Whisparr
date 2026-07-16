using System.Collections.Generic;
using System.Linq;
using NLog;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.History;

namespace NzbDrone.Core.Download.TrackedDownloads
{
    public interface ITrackedDownloadAlreadyImported
    {
        bool IsImported(TrackedDownload trackedDownload, List<EpisodeHistory> historyItems);
    }

    public class TrackedDownloadAlreadyImported : ITrackedDownloadAlreadyImported
    {
        private readonly Logger _logger;

        public TrackedDownloadAlreadyImported(Logger logger)
        {
            _logger = logger;
        }

        public bool IsImported(TrackedDownload trackedDownload, List<EpisodeHistory> historyItems)
        {
            _logger.Trace("Checking if all episodes for '{0}' have been imported", trackedDownload.DownloadItem.Title);

            if (historyItems.Empty())
            {
                _logger.Trace("No history for {0}", trackedDownload.DownloadItem.Title);
                return false;
            }

            var expectedEpisodeIds = trackedDownload.RemoteEpisode?.Episodes?.Select(e => e.Id).ToList()
                ?? historyItems
                    .Where(h => h.EventType == EpisodeHistoryEventType.Grabbed)
                    .Select(h => h.EpisodeId)
                    .Distinct()
                    .ToList();

            if (expectedEpisodeIds.Empty())
            {
                _logger.Trace("No expected episodes for {0}", trackedDownload.DownloadItem.Title);
                return false;
            }

            var allEpisodesImportedInHistory = expectedEpisodeIds.All(episodeId =>
            {
                var lastHistoryItem = historyItems
                    .Where(h => h.EpisodeId == episodeId)
                    .OrderByDescending(h => h.Date)
                    .FirstOrDefault();

                if (lastHistoryItem == null)
                {
                    _logger.Trace("No history for episode id: {0}", episodeId);
                    return false;
                }

                _logger.Trace("Last event for episode id: {0} is: {1}", episodeId, lastHistoryItem.EventType);

                return lastHistoryItem.EventType == EpisodeHistoryEventType.DownloadFolderImported;
            });

            _logger.Trace("All episodes for '{0}' have been imported: {1}", trackedDownload.DownloadItem.Title, allEpisodesImportedInHistory);

            return allEpisodesImportedInHistory;
        }
    }
}
