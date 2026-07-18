using System;
using System.Collections.Generic;
using System.Linq;
using NzbDrone.Common.Crypto;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.Download.TrackedDownloads;
using NzbDrone.Core.Languages;
using NzbDrone.Core.Messaging.Events;
using NzbDrone.Core.Qualities;
using NzbDrone.Core.SiteRip;
using NzbDrone.Core.Tv;

namespace NzbDrone.Core.Queue
{
    public interface IQueueService
    {
        List<Queue> GetQueue();
        Queue Find(int id);
        void Remove(int id);
    }

    public class QueueService : IQueueService, IHandle<TrackedDownloadRefreshedEvent>
    {
        private readonly IEventAggregator _eventAggregator;
        private readonly ISiteRipProgressService _siteRipProgressService;
        private readonly ISiteRipDownloadRepository _siteRipDownloadRepository;
        private readonly ISiteRipPendingFileService _siteRipPendingFileService;
        private readonly IEpisodeService _episodeService;
        private readonly ISeriesService _seriesService;
        private static List<Queue> _queue = new ();

        public QueueService(IEventAggregator eventAggregator,
                            ISiteRipProgressService siteRipProgressService,
                            ISiteRipDownloadRepository siteRipDownloadRepository,
                            ISiteRipPendingFileService siteRipPendingFileService,
                            IEpisodeService episodeService,
                            ISeriesService seriesService)
        {
            _eventAggregator = eventAggregator;
            _siteRipProgressService = siteRipProgressService;
            _siteRipDownloadRepository = siteRipDownloadRepository;
            _siteRipPendingFileService = siteRipPendingFileService;
            _episodeService = episodeService;
            _seriesService = seriesService;
        }

        public List<Queue> GetQueue()
        {
            return _queue;
        }

        public Queue Find(int id)
        {
            return _queue.SingleOrDefault(q => q.Id == id);
        }

        public void Remove(int id)
        {
            _queue.Remove(Find(id));
        }

        private IEnumerable<Queue> MapQueue(TrackedDownload trackedDownload)
        {
            if (TryGetSiteRipPendingEpisodes(trackedDownload, out var episodes, out var series))
            {
                foreach (var episode in episodes)
                {
                    yield return MapQueueItem(trackedDownload, episode, series);
                }

                yield break;
            }

            if (trackedDownload.RemoteEpisode?.Episodes != null && trackedDownload.RemoteEpisode.Episodes.Any())
            {
                foreach (var episode in trackedDownload.RemoteEpisode.Episodes)
                {
                    yield return MapQueueItem(trackedDownload, episode);
                }
            }
            else
            {
                yield return MapQueueItem(trackedDownload, null);
            }
        }

        private bool TryGetSiteRipPendingEpisodes(TrackedDownload trackedDownload, out List<Episode> episodes, out Series series)
        {
            episodes = null;
            series = null;

            var siteRipDownload = _siteRipDownloadRepository.FindByDownloadId(trackedDownload.DownloadItem.DownloadId);

            if (siteRipDownload == null)
            {
                return false;
            }

            var pendingFiles = _siteRipPendingFileService.GetPendingFiles(siteRipDownload.Id);

            if (pendingFiles.Empty())
            {
                return false;
            }

            var episodeIds = pendingFiles.Select(f => f.EpisodeId).Distinct().ToList();
            episodes = _episodeService.FindEpisodes(episodeIds);
            series = trackedDownload.RemoteEpisode?.Series ?? _seriesService.GetSeries(siteRipDownload.SeriesId);

            return episodes.Any() && series != null;
        }

        private Queue MapQueueItem(TrackedDownload trackedDownload, Episode episode, Series seriesOverride = null)
        {
            var queue = new Queue
            {
                Series = seriesOverride ?? trackedDownload.RemoteEpisode?.Series,
                Episode = episode,
                Languages = trackedDownload.RemoteEpisode?.Languages ?? new List<Language> { Language.Unknown },
                Quality = trackedDownload.RemoteEpisode?.ParsedEpisodeInfo.Quality ?? new QualityModel(Quality.Unknown),
                Title = _siteRipProgressService.FormatQueueTitle(episode, Parser.Parser.RemoveFileExtension(trackedDownload.DownloadItem.Title), trackedDownload.DownloadItem.DownloadId),
                Size = trackedDownload.DownloadItem.TotalSize,
                Sizeleft = trackedDownload.DownloadItem.RemainingSize,
                Timeleft = trackedDownload.DownloadItem.RemainingTime,
                Status = trackedDownload.DownloadItem.Status.ToString(),
                TrackedDownloadStatus = trackedDownload.Status,
                TrackedDownloadState = trackedDownload.State,
                StatusMessages = trackedDownload.StatusMessages.ToList(),
                ErrorMessage = trackedDownload.DownloadItem.Message,
                RemoteEpisode = trackedDownload.RemoteEpisode,
                DownloadId = trackedDownload.DownloadItem.DownloadId,
                Protocol = trackedDownload.Protocol,
                DownloadClient = trackedDownload.DownloadItem.DownloadClientInfo.Name,
                Indexer = trackedDownload.Indexer,
                OutputPath = trackedDownload.DownloadItem.OutputPath.ToString(),
                Added = trackedDownload.Added,
                DownloadClientHasPostImportCategory = trackedDownload.DownloadItem.DownloadClientInfo.HasPostImportCategory
            };

            queue.Id = HashConverter.GetHashInt31($"trackedDownload-{trackedDownload.DownloadClient}-{trackedDownload.DownloadItem.DownloadId}-ep{episode?.Id ?? 0}");

            if (episode != null &&
                _siteRipProgressService.TryGetEpisodeProgress(trackedDownload.DownloadItem.DownloadId, episode.Id, out var totalSize, out var remainingSize))
            {
                queue.Size = totalSize;
                queue.Sizeleft = remainingSize;
            }

            if (queue.Timeleft.HasValue)
            {
                queue.EstimatedCompletionTime = DateTime.UtcNow.Add(queue.Timeleft.Value);
            }

            return queue;
        }

        public void Handle(TrackedDownloadRefreshedEvent message)
        {
            _queue = message.TrackedDownloads
                .Where(t => t.IsTrackable)
                .OrderBy(c => c.DownloadItem.RemainingTime)
                .SelectMany(MapQueue)
                .ToList();

            _eventAggregator.PublishEvent(new QueueUpdatedEvent());
        }
    }
}
