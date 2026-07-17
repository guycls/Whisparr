using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.IndexerSearch.Definitions;
using NzbDrone.Core.Tv;

namespace NzbDrone.Core.Test.SiteRipTests
{
    [TestFixture]
    public class SiteRipSearchCriteriaFixture
    {
        [Test]
        public void should_use_studio_search_prefix_when_set()
        {
            var series = new Series
            {
                StudioSearchPrefix = "Brazzers",
                TitleSlug = "brazzers-exxtra"
            };

            SiteRipSearchCriteria.GetSearchTerm(series).Should().Be("Brazzers");
        }

        [Test]
        public void should_use_title_slug_when_prefix_not_set()
        {
            var series = new Series
            {
                StudioSearchPrefix = null,
                TitleSlug = "brazzers-exxtra"
            };

            SiteRipSearchCriteria.GetSearchTerm(series).Should().Be("brazzers-exxtra");
        }

        [Test]
        public void should_use_default_suffix_when_not_set()
        {
            var series = new Series
            {
                StudioSiteripSuffix = null
            };

            SiteRipSearchCriteria.GetSearchSuffix(series).Should().Be("siterip");
        }

        [Test]
        public void should_use_custom_suffix_when_set()
        {
            var series = new Series
            {
                StudioSiteripSuffix = "sitepack"
            };

            SiteRipSearchCriteria.GetSearchSuffix(series).Should().Be("sitepack");
        }
    }
}
