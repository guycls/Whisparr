using System.Collections.Generic;

namespace NzbDrone.Core.SiteRip
{
    public class TorrentFileMetadata
    {
        public int Index { get; set; }
        public string Path { get; set; }
        public string Name { get; set; }
        public long Size { get; set; }
    }

    public class SiteRipMatchResult
    {
        public List<int> FileIndices { get; set; } = new List<int>();
        public List<string> FilePaths { get; set; } = new List<string>();
        public long TotalSize { get; set; }
        public int? PartNumber { get; set; }
        public int? PartTotal { get; set; }
        public int? MatchedEpisodeId { get; set; }
        public string MatchConfidence { get; set; }
        public bool SelectedByDefault { get; set; }
        public string DisplayName { get; set; }
    }

    public class SiteRipGrabSelection
    {
        public List<int> FileIndices { get; set; } = new List<int>();
        public List<string> FilePaths { get; set; } = new List<string>();
        public int EpisodeId { get; set; }
    }
}
