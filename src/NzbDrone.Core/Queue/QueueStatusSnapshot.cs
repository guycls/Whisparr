namespace NzbDrone.Core.Queue
{
    public class QueueStatusSnapshot
    {
        public int TotalCount { get; set; }
        public int Count { get; set; }
        public int UnknownCount { get; set; }
        public bool Errors { get; set; }
        public bool Warnings { get; set; }
        public bool UnknownErrors { get; set; }
        public bool UnknownWarnings { get; set; }
    }
}
