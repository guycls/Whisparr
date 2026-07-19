using System;
using System.Collections.Generic;

namespace NzbDrone.Core.Tv
{
    public static class EpisodeQualityFilter
    {
        public const int MinTierIndex = 0;
        public const int MaxTierIndex = 6;

        private static readonly Dictionary<int, int> ResolutionByTier = new Dictionary<int, int>
        {
            { 1, 480 },
            { 2, 576 },
            { 3, 720 },
            { 4, 1080 },
            { 5, 2160 }
        };

        public static bool IsFullRange(int minIndex, int maxIndex)
        {
            return minIndex <= MinTierIndex && maxIndex >= MaxTierIndex;
        }

        public static string BuildWhereClause(int minIndex, int maxIndex)
        {
            if (IsFullRange(minIndex, maxIndex))
            {
                return null;
            }

            minIndex = Math.Max(minIndex, MinTierIndex);
            maxIndex = Math.Min(maxIndex, MaxTierIndex);

            var clauses = new List<string>();

            for (var tierIndex = minIndex; tierIndex <= maxIndex; tierIndex++)
            {
                clauses.Add(BuildTierClause(tierIndex));
            }

            return $"({string.Join(" OR ", clauses)})";
        }

        private static string BuildTierClause(int tierIndex)
        {
            if (tierIndex == 0)
            {
                return "\"Episodes\".\"EpisodeFileId\" = 0";
            }

            if (tierIndex == 6)
            {
                return "(\"Episodes\".\"EpisodeFileId\" != 0 AND (\"EpisodeFiles\".\"Quality\" LIKE '%\"source\":\"vr\"%' OR \"EpisodeFiles\".\"Quality\" LIKE '%\"source\": \"vr\"%'))";
            }

            if (!ResolutionByTier.TryGetValue(tierIndex, out var resolution))
            {
                return "1 = 0";
            }

            return $"(\"Episodes\".\"EpisodeFileId\" != 0 AND (\"EpisodeFiles\".\"Quality\" NOT LIKE '%\"source\":\"vr\"%' AND \"EpisodeFiles\".\"Quality\" NOT LIKE '%\"source\": \"vr\"%') AND (\"EpisodeFiles\".\"Quality\" LIKE '%\"resolution\":{resolution}%' OR \"EpisodeFiles\".\"Quality\" LIKE '%\"resolution\": {resolution}%'))";
        }
    }
}
