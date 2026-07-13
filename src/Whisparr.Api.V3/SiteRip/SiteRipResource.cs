using System.Collections.Generic;
using Whisparr.Http.REST;

namespace Whisparr.Api.V3.SiteRip
{
    public class SiteRipTorrentFileResource : RestResource
    {
        public int Index { get; set; }
        public string Path { get; set; }
        public string Name { get; set; }
        public long Size { get; set; }
    }

    public class SiteRipMatchResource : RestResource
    {
        public List<int> FileIndices { get; set; }
        public List<string> FilePaths { get; set; }
        public long TotalSize { get; set; }
        public int? PartNumber { get; set; }
        public int? PartTotal { get; set; }
        public int? MatchedEpisodeId { get; set; }
        public string MatchConfidence { get; set; }
        public bool SelectedByDefault { get; set; }
        public string DisplayName { get; set; }
    }

    public class SiteRipMatchRequestResource
    {
        public int SeriesId { get; set; }
        public List<SiteRipTorrentFileResource> Files { get; set; }
    }

    public class SiteRipGrabSelectionResource
    {
        public List<int> FileIndices { get; set; }
        public List<string> FilePaths { get; set; }
        public int EpisodeId { get; set; }
    }

    public class SiteRipGrabResource
    {
        public string Guid { get; set; }
        public int IndexerId { get; set; }
        public int SeriesId { get; set; }
        public List<SiteRipGrabSelectionResource> Selections { get; set; }
    }
}
