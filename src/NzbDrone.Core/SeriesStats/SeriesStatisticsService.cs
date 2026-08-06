using System.Collections.Generic;
using System.Linq;
using NzbDrone.Common.Cache;
using NzbDrone.Core.MediaFiles.Events;
using NzbDrone.Core.Messaging.Events;
using NzbDrone.Core.Tv.Events;

namespace NzbDrone.Core.SeriesStats
{
    public interface ISeriesStatisticsService
    {
        List<SeriesStatistics> SeriesStatistics();
        SeriesStatistics SeriesStatistics(int seriesId);
    }

    public class SeriesStatisticsService : ISeriesStatisticsService,
                                           IHandle<EpisodeImportedEvent>,
                                           IHandle<EpisodeFileDeletedEvent>,
                                           IHandle<EpisodeFileAddedEvent>,
                                           IHandle<SeriesDeletedEvent>
    {
        private const string AllStatsKey = "all";

        private readonly ISeriesStatisticsRepository _seriesStatisticsRepository;
        private readonly ICached<List<SeriesStatistics>> _allStatsCache;
        private readonly ICached<SeriesStatistics> _seriesStatsCache;

        public SeriesStatisticsService(ISeriesStatisticsRepository seriesStatisticsRepository, ICacheManager cacheManager)
        {
            _seriesStatisticsRepository = seriesStatisticsRepository;
            _allStatsCache = cacheManager.GetCache<List<SeriesStatistics>>(GetType(), "all");
            _seriesStatsCache = cacheManager.GetCache<SeriesStatistics>(GetType(), "series");
        }

        public List<SeriesStatistics> SeriesStatistics()
        {
            return _allStatsCache.Get(AllStatsKey, ComputeAllStatistics);
        }

        public SeriesStatistics SeriesStatistics(int seriesId)
        {
            return _seriesStatsCache.Get(GetSeriesKey(seriesId), () => ComputeSeriesStatistics(seriesId));
        }

        public void Handle(EpisodeImportedEvent message)
        {
            Invalidate(message.ImportedEpisode.SeriesId);
        }

        public void Handle(EpisodeFileDeletedEvent message)
        {
            Invalidate(message.EpisodeFile.SeriesId);
        }

        public void Handle(EpisodeFileAddedEvent message)
        {
            Invalidate(message.EpisodeFile.SeriesId);
        }

        public void Handle(SeriesDeletedEvent message)
        {
            _allStatsCache.Remove(AllStatsKey);

            foreach (var series in message.Series)
            {
                _seriesStatsCache.Remove(GetSeriesKey(series.Id));
            }
        }

        private List<SeriesStatistics> ComputeAllStatistics()
        {
            var seasonStatistics = _seriesStatisticsRepository.SeriesStatistics();

            return seasonStatistics.GroupBy(s => s.SeriesId).Select(s => MapSeriesStatistics(s.ToList())).ToList();
        }

        private SeriesStatistics ComputeSeriesStatistics(int seriesId)
        {
            var stats = _seriesStatisticsRepository.SeriesStatistics(seriesId);

            if (stats == null || stats.Count == 0)
            {
                return new SeriesStatistics();
            }

            return MapSeriesStatistics(stats);
        }

        private void Invalidate(int seriesId)
        {
            _allStatsCache.Remove(AllStatsKey);
            _seriesStatsCache.Remove(GetSeriesKey(seriesId));
        }

        private static string GetSeriesKey(int seriesId)
        {
            return $"series-{seriesId}";
        }

        private SeriesStatistics MapSeriesStatistics(List<SeasonStatistics> seasonStatistics)
        {
            var seriesStatistics = new SeriesStatistics
                                   {
                                       SeasonStatistics = seasonStatistics,
                                       SeriesId = seasonStatistics.First().SeriesId,
                                       EpisodeFileCount = seasonStatistics.Sum(s => s.EpisodeFileCount),
                                       EpisodeCount = seasonStatistics.Sum(s => s.EpisodeCount),
                                       TotalEpisodeCount = seasonStatistics.Sum(s => s.TotalEpisodeCount),
                                       SizeOnDisk = seasonStatistics.Sum(s => s.SizeOnDisk),
                                       ReleaseGroups = seasonStatistics.SelectMany(s => s.ReleaseGroups).Distinct().ToList()
                                   };

            var nextAiring = seasonStatistics.Where(s => s.NextAiring != null).MinBy(s => s.NextAiring);
            var previousAiring = seasonStatistics.Where(s => s.PreviousAiring != null).MaxBy(s => s.PreviousAiring);

            seriesStatistics.NextAiringString = nextAiring?.NextAiringString;
            seriesStatistics.PreviousAiringString = previousAiring?.PreviousAiringString;

            return seriesStatistics;
        }
    }
}
