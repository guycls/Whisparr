namespace Whisparr.Api.V3.Indexers
{
    public class SearchProgressResource
    {
        public string Phase { get; set; }
        public string Message { get; set; }
        public int IndexerCount { get; set; }
        public int CompletedIndexers { get; set; }
        public int ReleaseCount { get; set; }
        public bool IsComplete { get; set; }
        public string Error { get; set; }
    }

    public static class SearchProgressResourceMapper
    {
        public static SearchProgressResource ToResource(NzbDrone.Core.IndexerSearch.SearchProgress model)
        {
            if (model == null)
            {
                return null;
            }

            return new SearchProgressResource
            {
                Phase = model.Phase,
                Message = model.Message,
                IndexerCount = model.IndexerCount,
                CompletedIndexers = model.CompletedIndexers,
                ReleaseCount = model.ReleaseCount,
                IsComplete = model.IsComplete,
                Error = model.Error
            };
        }
    }
}
