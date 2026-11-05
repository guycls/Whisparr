using NzbDrone.Core.Datastore;

namespace Whisparr.Api.V3.Episodes
{
    public class EpisodeOrderResource
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public bool Monitored { get; set; }
        public int EpisodeFileId { get; set; }
    }

    public class EpisodeOrderRequestResource
    {
        public int SeriesId { get; set; }
        public string SortKey { get; set; }
        public SortDirection? SortDirection { get; set; }
        public string MonitorStatus { get; set; } = "all";
        public int QualityMinIndex { get; set; }
        public int QualityMaxIndex { get; set; } = 6;
        public int RuntimeMinMinutes { get; set; }
        public int? RuntimeMaxMinutes { get; set; }
    }
}
