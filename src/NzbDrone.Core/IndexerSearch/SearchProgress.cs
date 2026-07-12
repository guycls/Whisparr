namespace NzbDrone.Core.IndexerSearch
{
    public class SearchProgress
    {
        public string Phase { get; set; }
        public string Message { get; set; }
        public int IndexerCount { get; set; }
        public int CompletedIndexers { get; set; }
        public int ReleaseCount { get; set; }
        public bool IsComplete { get; set; }
        public string Error { get; set; }
    }
}
