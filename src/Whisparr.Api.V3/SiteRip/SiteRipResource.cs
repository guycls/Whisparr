using System.Collections.Generic;
using System.Linq;
using NzbDrone.Core.SiteRip;
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

    public class SiteRipMatchStartResource
    {
        public string MatchId { get; set; }
        public int SeriesId { get; set; }
        public string Guid { get; set; }
        public int IndexerId { get; set; }
    }

    public class SiteRipMatchProgressResource
    {
        public string Phase { get; set; }
        public string Message { get; set; }
        public int TotalFiles { get; set; }
        public int CompletedFiles { get; set; }
        public bool IsComplete { get; set; }
        public string Error { get; set; }
        public List<SiteRipTorrentFileResource> TorrentFiles { get; set; }
        public List<SiteRipMatchResource> Matches { get; set; }
    }

    public static class SiteRipMatchProgressResourceMapper
    {
        public static SiteRipMatchProgressResource ToResource(SiteRipMatchProgress model)
        {
            if (model == null)
            {
                return null;
            }

            return new SiteRipMatchProgressResource
            {
                Phase = model.Phase,
                Message = model.Message,
                TotalFiles = model.TotalFiles,
                CompletedFiles = model.CompletedFiles,
                IsComplete = model.IsComplete,
                Error = model.Error,
                TorrentFiles = model.TorrentFiles?.Select(f => new SiteRipTorrentFileResource
                {
                    Index = f.Index,
                    Path = f.Path,
                    Name = f.Name,
                    Size = f.Size
                }).ToList(),
                Matches = model.Matches?.Select(m => new SiteRipMatchResource
                {
                    FileIndices = m.FileIndices,
                    FilePaths = m.FilePaths,
                    TotalSize = m.TotalSize,
                    PartNumber = m.PartNumber,
                    PartTotal = m.PartTotal,
                    MatchedEpisodeId = m.MatchedEpisodeId,
                    MatchConfidence = m.MatchConfidence,
                    SelectedByDefault = m.SelectedByDefault,
                    DisplayName = m.DisplayName
                }).ToList()
            };
        }
    }
}
