using System;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.Tv;

namespace NzbDrone.Core.IndexerSearch
{
    public static class EpisodeSearchQueryBuilder
    {
        public static string GetDefaultQuery(Series series, Episode episode, bool ignoreSceneDate)
        {
            if (ignoreSceneDate)
            {
                return $"{series.StudioSearchTitle} {episode.Title}".Trim();
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

        public static string NormalizeForIndexer(string userQuery)
        {
            return userQuery?.Trim() ?? string.Empty;
        }
    }
}
