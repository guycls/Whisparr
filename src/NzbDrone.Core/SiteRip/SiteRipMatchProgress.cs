using System.Collections.Generic;

namespace NzbDrone.Core.SiteRip
{
    public class SiteRipMatchProgress
    {
        public string Phase { get; set; }
        public string Message { get; set; }
        public int TotalFiles { get; set; }
        public int CompletedFiles { get; set; }
        public bool IsComplete { get; set; }
        public string Error { get; set; }
        public List<TorrentFileMetadata> TorrentFiles { get; set; }
        public List<SiteRipMatchResult> Matches { get; set; }
    }
}
