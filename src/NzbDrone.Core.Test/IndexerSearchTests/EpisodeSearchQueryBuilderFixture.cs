using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.IndexerSearch;
using NzbDrone.Core.Tv;

namespace NzbDrone.Core.Test.IndexerSearchTests
{
    [TestFixture]
    public class EpisodeSearchQueryBuilderFixture
    {
        [Test]
        public void should_build_site_and_title_query_when_ignore_scene_date_enabled()
        {
            var series = new Series
            {
                StudioSearchPrefix = "Brazzers",
                Title = "Brazzers Exxtra",
                TitleSlug = "brazzers-exxtra"
            };

            var episode = new Episode
            {
                Title = "Test Scene"
            };

            EpisodeSearchQueryBuilder.GetDefaultQuery(series, episode, true)
                .Should().Be("Brazzers Test Scene");
        }

        [Test]
        public void should_build_site_and_date_query_when_ignore_scene_date_disabled()
        {
            var series = new Series
            {
                StudioSearchPrefix = "Brazzers",
                TitleSlug = "brazzers-exxtra"
            };

            var episode = new Episode
            {
                Title = "Test Scene",
                AirDate = "2021-03-15"
            };

            EpisodeSearchQueryBuilder.GetDefaultQuery(series, episode, false)
                .Should().Be("Brazzers 21.03.15");
        }

        [Test]
        public void should_use_title_slug_when_studio_prefix_not_set()
        {
            var series = new Series
            {
                TitleSlug = "brazzers-exxtra"
            };

            var episode = new Episode
            {
                Title = "Test Scene",
                AirDate = "2021-03-15"
            };

            EpisodeSearchQueryBuilder.GetDefaultQuery(series, episode, false)
                .Should().Be("brazzers-exxtra 21.03.15");
        }

        [Test]
        public void should_trim_user_query()
        {
            EpisodeSearchQueryBuilder.NormalizeForIndexer("  test query  ")
                .Should().Be("test query");
        }
    }
}
