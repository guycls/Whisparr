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

        [Test]
        public void should_clean_scene_title_when_enabled()
        {
            EpisodeSearchQueryBuilder.GetDefaultQuery(
                    new Series { StudioSearchPrefix = "Brazzers", Title = "Brazzers Exxtra" },
                    new Episode { Title = "My Scene 1080p.mp4" },
                    ignoreSceneDate: true,
                    cleanSceneTitle: true)
                .Should().Be("Brazzers My Scene");
        }

        [Test]
        public void should_not_clean_scene_title_when_disabled()
        {
            EpisodeSearchQueryBuilder.GetDefaultQuery(
                    new Series { StudioSearchPrefix = "Brazzers", Title = "Brazzers Exxtra" },
                    new Episode { Title = "My Scene 1080p.mp4" },
                    ignoreSceneDate: true,
                    cleanSceneTitle: false)
                .Should().Be("Brazzers My Scene 1080p.mp4");
        }

        [TestCase("My Scene 1080p.mp4", "My Scene")]
        [TestCase("My Scene - 720p", "My Scene")]
        [TestCase("My Scene 1080p:", "My Scene")]
        [TestCase("Amateur Boxxx Bitch Real Estate Agent Controlled 4k Mp4", "Amateur Boxxx Bitch Real Estate Agent Controlled")]
        [TestCase("Normal Scene Title", "Normal Scene Title")]
        public void should_clean_trailing_file_format_and_quality_from_scene_title(string title, string expected)
        {
            EpisodeSearchQueryBuilder.CleanSceneTitleForSearch(title)
                .Should().Be(expected);
        }
    }
}
