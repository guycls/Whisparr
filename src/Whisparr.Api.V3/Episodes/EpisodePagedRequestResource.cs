using Whisparr.Http;

namespace Whisparr.Api.V3.Episodes
{
    public class EpisodePagedRequestResource : PagingRequestResource
    {
        public int SeriesId { get; set; }
        public bool IncludeImages { get; set; }
        public string MonitorStatus { get; set; } = "all";
        public int QualityMinIndex { get; set; } = 0;
        public int QualityMaxIndex { get; set; } = 6;
        public int RuntimeMinMinutes { get; set; } = 0;
        public int? RuntimeMaxMinutes { get; set; }
    }
}
