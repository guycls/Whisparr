using NzbDrone.Common.Extensions;
using NzbDrone.Core.Tv;

namespace NzbDrone.Core.IndexerSearch.Definitions
{
    public class SiteRipSearchCriteria : SearchCriteriaBase
    {
        public static string GetSearchTerm(Series series)
        {
            return series.StudioSearchPrefix.IsNotNullOrWhiteSpace()
                ? series.StudioSearchTitle
                : series.TitleSlug;
        }

        public static string GetSearchSuffix(Series series)
        {
            return series.StudioSiteripSuffix.IsNotNullOrWhiteSpace()
                ? series.StudioSiteripSuffix.Trim()
                : "siterip";
        }

        public override string ToString()
        {
            return string.Format("[{0} : SiteRIP]", Series?.Title);
        }
    }
}
