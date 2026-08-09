using System;
using System.Linq;
using System.Text.RegularExpressions;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.MediaFiles;
using NzbDrone.Core.Tv;

namespace NzbDrone.Core.IndexerSearch
{
    public static class EpisodeSearchQueryBuilder
    {
        private static readonly Regex TrailingQualityRegex = new Regex(
            @"(?:[\s\-:]+)?(?:4k|2160p|1080p|720p|480p|360p|540p|576p|1440p|fhd|hd|uhd|sd)$",
            RegexOptions.IgnoreCase | RegexOptions.Compiled);

        private static readonly Regex TrailingExtensionRegex = new Regex(
            $@"\.?(?:{string.Join("|", MediaFileExtensions.Extensions.Select(e => Regex.Escape(e.TrimStart('.'))).OrderByDescending(e => e.Length))})$",
            RegexOptions.IgnoreCase | RegexOptions.Compiled);

        public static string GetDefaultQuery(Series series, Episode episode, bool ignoreSceneDate, bool cleanSceneTitle = false)
        {
            if (ignoreSceneDate)
            {
                var episodeTitle = cleanSceneTitle
                    ? CleanSceneTitleForSearch(episode.Title)
                    : episode.Title;

                return $"{series.StudioSearchTitle} {episodeTitle}".Trim();
            }

            var sceneTitle = series.StudioSearchPrefix.IsNotNullOrWhiteSpace()
                ? series.StudioSearchTitle
                : series.TitleSlug;

            if (episode.AirDate.IsNullOrWhiteSpace())
            {
                return sceneTitle?.Trim() ?? string.Empty;
            }

            var releaseDate = DateOnly.Parse(episode.AirDate);
            return $"{sceneTitle} {releaseDate:yy.MM.dd}".Trim();
        }

        public static string CleanSceneTitleForSearch(string title)
        {
            if (title.IsNullOrWhiteSpace())
            {
                return title ?? string.Empty;
            }

            var result = title.Trim();
            var changed = true;

            while (changed)
            {
                changed = false;

                var extensionMatch = TrailingExtensionRegex.Match(result);
                if (extensionMatch.Success)
                {
                    result = result.Substring(0, extensionMatch.Index).TrimEnd();
                    changed = true;
                }

                var qualityMatch = TrailingQualityRegex.Match(result);
                if (qualityMatch.Success)
                {
                    result = result.Substring(0, qualityMatch.Index).TrimEnd();
                    changed = true;
                }
            }

            return result.TrimEnd('-', ':', ' ').Trim();
        }

        public static string NormalizeForIndexer(string userQuery)
        {
            return userQuery?.Trim() ?? string.Empty;
        }
    }
}
