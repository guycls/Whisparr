using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using NzbDrone.Core.Parser;
using NzbDrone.Core.Tv;

namespace NzbDrone.Core.SiteRip
{
    public interface ISiteRipMatchingService
    {
        List<SiteRipMatchResult> MatchFiles(int seriesId, List<TorrentFileMetadata> files);
    }

    public class SiteRipMatchingService : ISiteRipMatchingService
    {
        private readonly IEpisodeService _episodeService;

        public SiteRipMatchingService(IEpisodeService episodeService)
        {
            _episodeService = episodeService;
        }

        public List<SiteRipMatchResult> MatchFiles(int seriesId, List<TorrentFileMetadata> files)
        {
            var episodes = _episodeService.GetEpisodeBySeries(seriesId);
            var results = new List<SiteRipMatchResult>();

            foreach (var file in files.OrderBy(f => f.Path))
            {
                var partInfo = FilePartParser.Parse(file.Path);
                var matchedEpisode = _episodeService.MatchEpisodeByImportFileName(episodes, file.Path);

                var confidence = matchedEpisode == null ? "none" : "auto";

                results.Add(new SiteRipMatchResult
                {
                    FileIndices = new List<int> { file.Index },
                    FilePaths = new List<string> { file.Path },
                    TotalSize = file.Size,
                    PartNumber = partInfo.PartNumber,
                    PartTotal = partInfo.PartTotal,
                    MatchedEpisodeId = matchedEpisode?.Id,
                    MatchConfidence = confidence,
                    SelectedByDefault = ShouldSelectByDefault(matchedEpisode),
                    DisplayName = file.Name
                });
            }

            return GroupMultiPartFiles(results);
        }

        private static List<SiteRipMatchResult> GroupMultiPartFiles(List<SiteRipMatchResult> results)
        {
            var grouped = new List<SiteRipMatchResult>();
            var consumed = new HashSet<int>();

            for (var i = 0; i < results.Count; i++)
            {
                if (consumed.Contains(i))
                {
                    continue;
                }

                var current = results[i];

                if (!current.PartNumber.HasValue)
                {
                    grouped.Add(current);
                    continue;
                }

                var group = new List<SiteRipMatchResult> { current };
                consumed.Add(i);

                for (var j = i + 1; j < results.Count; j++)
                {
                    if (consumed.Contains(j))
                    {
                        continue;
                    }

                    var other = results[j];

                    if (other.PartNumber.HasValue &&
                        current.MatchedEpisodeId == other.MatchedEpisodeId &&
                        GetBaseName(current.DisplayName) == GetBaseName(other.DisplayName))
                    {
                        group.Add(other);
                        consumed.Add(j);
                    }
                }

                if (group.Count == 1)
                {
                    grouped.Add(current);
                    continue;
                }

                grouped.Add(new SiteRipMatchResult
                {
                    FileIndices = group.SelectMany(g => g.FileIndices).ToList(),
                    FilePaths = group.SelectMany(g => g.FilePaths).ToList(),
                    TotalSize = group.Sum(g => g.TotalSize),
                    PartNumber = current.PartNumber,
                    PartTotal = current.PartTotal ?? group.Count,
                    MatchedEpisodeId = current.MatchedEpisodeId,
                    MatchConfidence = current.MatchConfidence,
                    SelectedByDefault = group.Any(g => g.SelectedByDefault),
                    DisplayName = GetBaseName(current.DisplayName)
                });
            }

            return grouped;
        }

        private static bool ShouldSelectByDefault(Episode matchedEpisode)
        {
            return matchedEpisode != null
                && matchedEpisode.Monitored
                && !matchedEpisode.HasFile;
        }

        private static string GetBaseName(string fileName)
        {
            var partInfo = FilePartParser.Parse(fileName);
            var name = Path.GetFileNameWithoutExtension(fileName);

            if (partInfo.PartNumber.HasValue)
            {
                name = BracketPartRegex.Replace(name, string.Empty).Trim();
            }

            return name;
        }

        private static readonly System.Text.RegularExpressions.Regex BracketPartRegex =
            new System.Text.RegularExpressions.Regex(@"\[\d{1,3}[/+]\d{1,3}\]", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
    }
}
