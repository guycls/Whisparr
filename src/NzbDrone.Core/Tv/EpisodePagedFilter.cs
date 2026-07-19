namespace NzbDrone.Core.Tv
{
    public class EpisodePagedFilter
    {
        public string MonitorStatus { get; set; } = "all";
        public int QualityMinIndex { get; set; } = 0;
        public int QualityMaxIndex { get; set; } = 6;
        public int RuntimeMinMinutes { get; set; } = 0;
        public int? RuntimeMaxMinutes { get; set; }

        public bool RequiresEpisodeFileJoin =>
            !EpisodeQualityFilter.IsFullRange(QualityMinIndex, QualityMaxIndex);

        public bool RequiresRuntimeFilter =>
            RuntimeMinMinutes > 0 || RuntimeMaxMinutes.HasValue;
    }
}
