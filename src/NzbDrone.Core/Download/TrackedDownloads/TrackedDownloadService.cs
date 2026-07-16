using System;
using System.Collections.Generic;
using System.Linq;
using NLog;
using NzbDrone.Common.Cache;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.CustomFormats;
using NzbDrone.Core.Download.Aggregation;
using NzbDrone.Core.Download.History;
using NzbDrone.Core.History;
using NzbDrone.Core.Messaging.Events;
using NzbDrone.Core.Parser;
using NzbDrone.Core.Parser.Model;
using NzbDrone.Core.Qualities;
using NzbDrone.Core.SiteRip;
using NzbDrone.Core.Tv;
using NzbDrone.Core.Tv.Events;

namespace NzbDrone.Core.Download.TrackedDownloads
{
    public interface ITrackedDownloadService
    {
        TrackedDownload Find(string downloadId);
        void StopTracking(string downloadId);
        void StopTracking(List<string> downloadIds);
        TrackedDownload TrackDownload(DownloadClientDefinition downloadClient, DownloadClientItem downloadItem);
        List<TrackedDownload> GetTrackedDownloads();
        void UpdateTrackable(List<TrackedDownload> trackedDownloads);
        void RemoveEpisodes(string downloadId, IEnumerable<int> episodeIds);
    }

    public class TrackedDownloadService : ITrackedDownloadService,
                                          IHandle<EpisodeInfoRefreshedEvent>,
                                          IHandle<SeriesAddedEvent>,
                                          IHandle<SeriesDeletedEvent>
    {
        private readonly IParsingService _parsingService;
        private readonly IHistoryService _historyService;
        private readonly IEventAggregator _eventAggregator;
        private readonly IDownloadHistoryService _downloadHistoryService;
        private readonly IRemoteEpisodeAggregationService _aggregationService;
        private readonly ICustomFormatCalculationService _formatCalculator;
        private readonly ISeriesService _seriesService;
        private readonly IEpisodeService _episodeService;
        private readonly ISiteRipDownloadRepository _siteRipDownloadRepository;
        private readonly ISiteRipDownloadFileRepository _siteRipDownloadFileRepository;
        private readonly ISiteRipPendingFileService _siteRipPendingFileService;
        private readonly Logger _logger;
        private readonly ICached<TrackedDownload> _cache;

        public TrackedDownloadService(IParsingService parsingService,
                                      ICacheManager cacheManager,
                                      IHistoryService historyService,
                                      ICustomFormatCalculationService formatCalculator,
                                      IEventAggregator eventAggregator,
                                      IDownloadHistoryService downloadHistoryService,
                                      IRemoteEpisodeAggregationService aggregationService,
                                      ISeriesService seriesService,
                                      IEpisodeService episodeService,
                                      ISiteRipDownloadRepository siteRipDownloadRepository,
                                      ISiteRipDownloadFileRepository siteRipDownloadFileRepository,
                                      ISiteRipPendingFileService siteRipPendingFileService,
                                      Logger logger)
        {
            _parsingService = parsingService;
            _historyService = historyService;
            _formatCalculator = formatCalculator;
            _eventAggregator = eventAggregator;
            _downloadHistoryService = downloadHistoryService;
            _aggregationService = aggregationService;
            _seriesService = seriesService;
            _episodeService = episodeService;
            _siteRipDownloadRepository = siteRipDownloadRepository;
            _siteRipDownloadFileRepository = siteRipDownloadFileRepository;
            _siteRipPendingFileService = siteRipPendingFileService;
            _cache = cacheManager.GetCache<TrackedDownload>(GetType());
            _logger = logger;
        }

        public TrackedDownload Find(string downloadId)
        {
            return _cache.Find(downloadId);
        }

        public void StopTracking(string downloadId)
        {
            var trackedDownload = _cache.Find(downloadId);

            _cache.Remove(downloadId);
            _eventAggregator.PublishEvent(new TrackedDownloadsRemovedEvent(new List<TrackedDownload> { trackedDownload }));
        }

        public void StopTracking(List<string> downloadIds)
        {
            var trackedDownloads = new List<TrackedDownload>();

            foreach (var downloadId in downloadIds)
            {
                var trackedDownload = _cache.Find(downloadId);
                _cache.Remove(downloadId);
                trackedDownloads.Add(trackedDownload);
            }

            _eventAggregator.PublishEvent(new TrackedDownloadsRemovedEvent(trackedDownloads));
        }

        public TrackedDownload TrackDownload(DownloadClientDefinition downloadClient, DownloadClientItem downloadItem)
        {
            var existingItem = Find(downloadItem.DownloadId);

            if (existingItem != null && existingItem.State != TrackedDownloadState.Downloading)
            {
                if (!ShouldReactivateTracking(downloadItem.DownloadId))
                {
                    LogItemChange(existingItem, existingItem.DownloadItem, downloadItem);

                    existingItem.DownloadItem = downloadItem;
                    existingItem.IsTrackable = true;

                    return existingItem;
                }
            }

            var trackedDownload = new TrackedDownload
            {
                DownloadClient = downloadClient.Id,
                DownloadItem = downloadItem,
                Protocol = downloadClient.Protocol,
                IsTrackable = true,
                HasNotifiedManualInteractionRequired = existingItem?.HasNotifiedManualInteractionRequired ?? false
            };

            try
            {
                var historyItems = FindHistoryByDownloadId(downloadItem.DownloadId)
                    .OrderByDescending(h => h.Date)
                    .ToList();

                var siteRipDownload = _siteRipDownloadRepository.FindByDownloadId(downloadItem.DownloadId);
                var isSiteRipDownload = siteRipDownload != null;
                var grabbedEvent = historyItems.FirstOrDefault(v => v.EventType == EpisodeHistoryEventType.Grabbed);

                var downloadHistory = _downloadHistoryService.GetLatestDownloadHistoryItem(downloadItem.DownloadId);

                if (downloadHistory != null)
                {
                    var state = GetStateFromHistory(downloadHistory.EventType);
                    trackedDownload.State = state;
                }

                if (isSiteRipDownload &&
                    _siteRipPendingFileService.HasPendingFiles(siteRipDownload.Id))
                {
                    trackedDownload.State = TrackedDownloadState.Downloading;
                }

                var parsedEpisodeInfo = Parser.Parser.ParseTitle(trackedDownload.DownloadItem.Title);

                var isForceDownload = IsForceDownload(historyItems) || isSiteRipDownload;

                // Only do normal parsing if this is NOT a force download
                if (!isForceDownload && parsedEpisodeInfo != null)
                {
                    trackedDownload.RemoteEpisode = _parsingService.Map(parsedEpisodeInfo, 0);
                    _aggregationService.Augment(trackedDownload.RemoteEpisode);
                }

                if (isSiteRipDownload)
                {
                    TryBuildSiteRipRemoteEpisode(trackedDownload, grabbedEvent, parsedEpisodeInfo, siteRipDownload);
                }

                if (historyItems.Any())
                {
                    var firstHistoryItem = historyItems.First();

                    trackedDownload.Indexer = grabbedEvent?.Data?.GetValueOrDefault("indexer");
                    trackedDownload.Added = grabbedEvent?.Date;

                    if (isForceDownload &&
                        (trackedDownload.RemoteEpisode?.Series == null || trackedDownload.RemoteEpisode.Episodes.Empty()))
                    {
                        // For forced downloads, recreate RemoteEpisode from history data
                        var series = _seriesService.GetSeries(grabbedEvent?.SeriesId ?? firstHistoryItem.SeriesId);
                        var episodeIds = historyItems.Where(h => h.EventType == EpisodeHistoryEventType.Grabbed)
                                                    .Select(h => h.EpisodeId)
                                                    .Distinct()
                                                    .ToList();
                        var episodes = _episodeService.GetEpisodes(episodeIds);

                        if (series != null && episodes.Any())
                        {
                            trackedDownload.RemoteEpisode = new RemoteEpisode
                            {
                                Series = series,
                                Episodes = episodes,
                                Languages = grabbedEvent?.Languages ?? firstHistoryItem.Languages,
                                ParsedEpisodeInfo = parsedEpisodeInfo ?? new ParsedEpisodeInfo { Quality = grabbedEvent?.Quality ?? firstHistoryItem.Quality },
                                ShouldOverride = true
                            };
                        }
                    }

                    if (!isSiteRipDownload &&
                        (parsedEpisodeInfo == null ||
                         trackedDownload.RemoteEpisode?.Series == null ||
                         trackedDownload.RemoteEpisode.Episodes.Empty()))
                    {
                        // Try parsing the original source title and if that fails, try parsing it as a special
                        // TODO: Pass the TVDB ID and TVRage IDs in as well so we have a better chance for finding the item
                        parsedEpisodeInfo = Parser.Parser.ParseTitle(firstHistoryItem.SourceTitle) ??
                                            _parsingService.ParseSpecialEpisodeTitle(parsedEpisodeInfo, firstHistoryItem.SourceTitle, 0);

                        if (parsedEpisodeInfo != null)
                        {
                            trackedDownload.RemoteEpisode = _parsingService.Map(parsedEpisodeInfo,
                                firstHistoryItem.SeriesId,
                                historyItems.Where(v => v.EventType == EpisodeHistoryEventType.Grabbed)
                                    .Select(h => h.EpisodeId).Distinct());
                        }
                    }

                    if (trackedDownload.RemoteEpisode != null &&
                        Enum.TryParse(grabbedEvent?.Data?.GetValueOrDefault("indexerFlags"), true, out IndexerFlags flags))
                    {
                        trackedDownload.RemoteEpisode.Release ??= new ReleaseInfo();
                        trackedDownload.RemoteEpisode.Release.IndexerFlags = flags;
                    }
                }

                // Calculate custom formats
                if (trackedDownload.RemoteEpisode != null)
                {
                    trackedDownload.RemoteEpisode.CustomFormats = _formatCalculator.ParseCustomFormat(trackedDownload.RemoteEpisode, downloadItem.TotalSize);
                }

                // Track it so it can be displayed in the queue even though we can't determine which series it is for
                if (trackedDownload.RemoteEpisode == null)
                {
                    _logger.Trace("No Episode found for download '{0}'", trackedDownload.DownloadItem.Title);
                }
            }
            catch (MultipleSeriesFoundException e)
            {
                _logger.Debug(e, "Found multiple series for " + downloadItem.Title);

                trackedDownload.Warn("Unable to import automatically, found multiple series: {0}", string.Join(", ", e.Series));
            }
            catch (Exception e)
            {
                _logger.Debug(e, "Failed to find episode for " + downloadItem.Title);

                trackedDownload.Warn("Unable to parse episodes from title");
            }

            LogItemChange(trackedDownload, existingItem?.DownloadItem, trackedDownload.DownloadItem);

            _cache.Set(trackedDownload.DownloadItem.DownloadId, trackedDownload);
            return trackedDownload;
        }

        public List<TrackedDownload> GetTrackedDownloads()
        {
            return _cache.Values.ToList();
        }

        public void UpdateTrackable(List<TrackedDownload> trackedDownloads)
        {
            var untrackable = GetTrackedDownloads().ExceptBy(t => t.DownloadItem.DownloadId, trackedDownloads, t => t.DownloadItem.DownloadId, StringComparer.CurrentCulture).ToList();

            foreach (var trackedDownload in untrackable)
            {
                trackedDownload.IsTrackable = false;
            }
        }

        public void RemoveEpisodes(string downloadId, IEnumerable<int> episodeIds)
        {
            var trackedDownload = Find(downloadId);

            if (trackedDownload?.RemoteEpisode?.Episodes == null)
            {
                return;
            }

            var idsToRemove = episodeIds.ToHashSet();
            trackedDownload.RemoteEpisode.Episodes = trackedDownload.RemoteEpisode.Episodes
                .Where(e => !idsToRemove.Contains(e.Id))
                .ToList();
        }

        private void LogItemChange(TrackedDownload trackedDownload, DownloadClientItem existingItem, DownloadClientItem downloadItem)
        {
            if (existingItem == null ||
                existingItem.Status != downloadItem.Status ||
                existingItem.CanBeRemoved != downloadItem.CanBeRemoved ||
                existingItem.CanMoveFiles != downloadItem.CanMoveFiles)
            {
                _logger.Debug("Tracking '{0}:{1}': ClientState={2}{3} WhisparrStage={4} Episode='{5}' OutputPath={6}.",
                    downloadItem.DownloadClientInfo.Name,
                    downloadItem.Title,
                    downloadItem.Status,
                    downloadItem.CanBeRemoved ? "" : downloadItem.CanMoveFiles ? " (busy)" : " (readonly)",
                    trackedDownload.State,
                    trackedDownload.RemoteEpisode?.ParsedEpisodeInfo,
                    downloadItem.OutputPath);
            }
        }

        private void UpdateCachedItem(TrackedDownload trackedDownload)
        {
            // Preserve the ShouldOverride flag from Force Downloads
            var existingShouldOverride = trackedDownload.RemoteEpisode?.ShouldOverride ?? false;
            var existingSeries = trackedDownload.RemoteEpisode?.Series;
            var existingEpisodes = trackedDownload.RemoteEpisode?.Episodes;

            var parsedEpisodeInfo = Parser.Parser.ParseTitle(trackedDownload.DownloadItem.Title);

            trackedDownload.RemoteEpisode = parsedEpisodeInfo == null ? null : _parsingService.Map(parsedEpisodeInfo, 0);

            // If this was a forced download, restore the override flag and forced data
            if (existingShouldOverride && trackedDownload.RemoteEpisode != null)
            {
                trackedDownload.RemoteEpisode.ShouldOverride = true;

                // Also preserve the forced series and episodes
                if (existingSeries != null)
                {
                    trackedDownload.RemoteEpisode.Series = existingSeries;
                }

                if (existingEpisodes != null)
                {
                    trackedDownload.RemoteEpisode.Episodes = existingEpisodes;
                }
            }

            _aggregationService.Augment(trackedDownload.RemoteEpisode);
        }

        private static TrackedDownloadState GetStateFromHistory(DownloadHistoryEventType eventType)
        {
            switch (eventType)
            {
                case DownloadHistoryEventType.DownloadImported:
                    return TrackedDownloadState.Imported;
                case DownloadHistoryEventType.DownloadFailed:
                    return TrackedDownloadState.Failed;
                case DownloadHistoryEventType.DownloadIgnored:
                    return TrackedDownloadState.Ignored;
                default:
                    return TrackedDownloadState.Downloading;
            }
        }

        public void Handle(EpisodeInfoRefreshedEvent message)
        {
            var needsToUpdate = false;

            foreach (var episode in message.Removed)
            {
                var cachedItems = _cache.Values.Where(t =>
                                            t.RemoteEpisode?.Episodes != null &&
                                            t.RemoteEpisode.Episodes.Any(e => e.Id == episode.Id))
                                        .ToList();

                if (cachedItems.Any())
                {
                    needsToUpdate = true;
                }

                cachedItems.ForEach(UpdateCachedItem);
            }

            if (needsToUpdate)
            {
                _eventAggregator.PublishEvent(new TrackedDownloadRefreshedEvent(GetTrackedDownloads()));
            }
        }

        public void Handle(SeriesAddedEvent message)
        {
            var cachedItems = _cache.Values
                .Where(t =>
                    t.RemoteEpisode?.Series == null ||
                    message.Series?.TvdbId == t.RemoteEpisode.Series.TvdbId)
                .ToList();

            if (cachedItems.Any())
            {
                cachedItems.ForEach(UpdateCachedItem);

                _eventAggregator.PublishEvent(new TrackedDownloadRefreshedEvent(GetTrackedDownloads()));
            }
        }

        public void Handle(SeriesDeletedEvent message)
        {
            var cachedItems = _cache.Values
                .Where(t =>
                    t.RemoteEpisode?.Series != null &&
                    message.Series.Any(s => s.Id == t.RemoteEpisode.Series.Id || s.TvdbId == t.RemoteEpisode.Series.TvdbId))
                .ToList();

            if (cachedItems.Any())
            {
                cachedItems.ForEach(UpdateCachedItem);

                _eventAggregator.PublishEvent(new TrackedDownloadRefreshedEvent(GetTrackedDownloads()));
            }
        }

        private bool IsForceDownload(List<EpisodeHistory> historyItems)
        {
            if (!historyItems.Any())
            {
                return false;
            }

            var grabbedEvent = historyItems.FirstOrDefault(v => v.EventType == EpisodeHistoryEventType.Grabbed);
            return grabbedEvent?.Data.GetShouldOverride() == true ||
                   grabbedEvent?.Data.GetIsSiteRip() == true;
        }

        private List<EpisodeHistory> FindHistoryByDownloadId(string downloadId)
        {
            if (downloadId.IsNullOrWhiteSpace())
            {
                return new List<EpisodeHistory>();
            }

            var history = _historyService.FindByDownloadId(downloadId);

            if (history.Any())
            {
                return history;
            }

            var alternateId = downloadId.Equals(downloadId.ToUpper(), StringComparison.Ordinal)
                ? downloadId.ToLower()
                : downloadId.ToUpper();

            return _historyService.FindByDownloadId(alternateId);
        }

        private bool ShouldReactivateTracking(string downloadId)
        {
            if (!_downloadHistoryService.DownloadAlreadyImported(downloadId))
            {
                return true;
            }

            var existing = Find(downloadId);

            if (existing?.State == TrackedDownloadState.Imported)
            {
                return false;
            }

            var siteRipDownload = _siteRipDownloadRepository.FindByDownloadId(downloadId);

            if (siteRipDownload == null)
            {
                return false;
            }

            return _siteRipPendingFileService.HasPendingFiles(siteRipDownload.Id);
        }

        private bool TryBuildSiteRipRemoteEpisode(TrackedDownload trackedDownload, EpisodeHistory grabbedHistoryItem, ParsedEpisodeInfo parsedEpisodeInfo, SiteRipDownload siteRipDownload)
        {
            if (siteRipDownload == null)
            {
                _logger.Debug("SiteRIP queue metadata for {0}: no SiteRipDownload record", trackedDownload.DownloadItem.DownloadId);
                return false;
            }

            var pendingFiles = _siteRipPendingFileService.GetPendingFiles(siteRipDownload.Id);
            var episodeIds = pendingFiles.Select(f => f.EpisodeId).Distinct().ToList();

            if (episodeIds.Empty())
            {
                _logger.Debug("SiteRIP queue metadata for {0}: no pending files without library media", trackedDownload.DownloadItem.DownloadId);
                return false;
            }

            var unimportedDbCount = _siteRipDownloadFileRepository.GetUnimportedByDownloadId(siteRipDownload.Id).Count;

            if (pendingFiles.Count != unimportedDbCount)
            {
                _logger.Debug(
                    "SiteRIP queue/import sync for {0}: {1} file row(s) without library media, {2} DB unimported row(s)",
                    trackedDownload.DownloadItem.DownloadId,
                    pendingFiles.Count,
                    unimportedDbCount);
            }

            var series = _seriesService.GetSeries(siteRipDownload.SeriesId);
            var episodes = _episodeService.GetEpisodes(episodeIds);

            if (series == null)
            {
                _logger.Debug("SiteRIP queue metadata for {0}: series {1} not found", trackedDownload.DownloadItem.DownloadId, siteRipDownload.SeriesId);
                return false;
            }

            if (episodes.Empty())
            {
                _logger.Debug("SiteRIP queue metadata for {0}: no episodes resolved for pending ids", trackedDownload.DownloadItem.DownloadId);
                return false;
            }

            trackedDownload.RemoteEpisode = new RemoteEpisode
            {
                Series = series,
                Episodes = episodes,
                Languages = grabbedHistoryItem?.Languages,
                ParsedEpisodeInfo = parsedEpisodeInfo ?? new ParsedEpisodeInfo { Quality = grabbedHistoryItem?.Quality ?? new QualityModel(Quality.Unknown) },
                ShouldOverride = true,
                ReleaseSource = ReleaseSourceType.SiteRip
            };

            _logger.Debug("SiteRIP queue metadata for {0}: {1} pending episode(s) from DB", trackedDownload.DownloadItem.DownloadId, episodes.Count);

            return true;
        }
    }
}
