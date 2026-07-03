using System.Collections.Generic;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.MediaCover;
using NzbDrone.Core.MetadataSource;
using NzbDrone.Core.MetadataSource.ThePornDb;
using NzbDrone.Core.Test.Framework;
using NzbDrone.Core.Tv;

namespace NzbDrone.Core.Test.MetadataSource
{
    [TestFixture]
    public class EpisodeImageEnrichmentServiceFixture : CoreTest<EpisodeImageEnrichmentService>
    {
        [SetUp]
        public void Setup()
        {
            Mocker.GetMock<IConfigService>()
                .SetupGet(c => c.TpdbRefetchThumbnails)
                .Returns(false);
        }

        [Test]
        public void should_skip_when_api_key_not_set()
        {
            Mocker.GetMock<IConfigService>()
                .SetupGet(c => c.TpdbApiKey)
                .Returns(string.Empty);

            var episode = CreateEpisode(123);

            Subject.Enrich(new List<Episode> { episode });

            Mocker.GetMock<ITpdbSceneClient>().Verify(c => c.GetScreenshotUrl(It.IsAny<int>()), Times.Never);
            episode.Images.Should().BeEmpty();
        }

        [Test]
        public void should_add_screenshot_when_tpdb_returns_url()
        {
            Mocker.GetMock<IConfigService>()
                .SetupGet(c => c.TpdbApiKey)
                .Returns("test-key");

            Mocker.GetMock<ITpdbSceneClient>()
                .Setup(c => c.GetScreenshotUrl(123))
                .Returns("https://example.com/scene.jpg");

            var episode = CreateEpisode(123);

            Subject.Enrich(new List<Episode> { episode });

            episode.Images.Should().ContainSingle(i =>
                i.CoverType == MediaCoverTypes.Screenshot &&
                i.RemoteUrl == "https://example.com/scene.jpg");
        }

        [Test]
        public void should_not_enrich_when_screenshot_already_present()
        {
            Mocker.GetMock<IConfigService>()
                .SetupGet(c => c.TpdbApiKey)
                .Returns("test-key");

            var episode = CreateEpisode(123);
            episode.Images.Add(new MediaCover.MediaCover(MediaCoverTypes.Screenshot, "https://example.com/existing.jpg"));

            Subject.Enrich(new List<Episode> { episode });

            Mocker.GetMock<ITpdbSceneClient>().Verify(c => c.GetScreenshotUrl(It.IsAny<int>()), Times.Never);
            episode.Images.Should().ContainSingle();
        }

        [Test]
        public void should_not_enrich_when_db_episode_has_screenshot_and_refetch_disabled()
        {
            Mocker.GetMock<IConfigService>()
                .SetupGet(c => c.TpdbApiKey)
                .Returns("test-key");

            var remoteEpisode = CreateEpisode(123);
            var existingEpisode = CreateEpisode(123);
            existingEpisode.Images.Add(new MediaCover.MediaCover(MediaCoverTypes.Screenshot, "https://example.com/existing.jpg"));

            Subject.Enrich(new List<Episode> { remoteEpisode }, new List<Episode> { existingEpisode });

            Mocker.GetMock<ITpdbSceneClient>().Verify(c => c.GetScreenshotUrl(It.IsAny<int>()), Times.Never);
            remoteEpisode.Images.Should().BeEmpty();
        }

        [Test]
        public void should_enrich_when_db_episode_has_no_screenshot_and_refetch_disabled()
        {
            Mocker.GetMock<IConfigService>()
                .SetupGet(c => c.TpdbApiKey)
                .Returns("test-key");

            Mocker.GetMock<ITpdbSceneClient>()
                .Setup(c => c.GetScreenshotUrl(123))
                .Returns("https://example.com/scene.jpg");

            var remoteEpisode = CreateEpisode(123);
            var existingEpisode = CreateEpisode(123);

            Subject.Enrich(new List<Episode> { remoteEpisode }, new List<Episode> { existingEpisode });

            remoteEpisode.Images.Should().ContainSingle(i =>
                i.CoverType == MediaCoverTypes.Screenshot &&
                i.RemoteUrl == "https://example.com/scene.jpg");
        }

        [Test]
        public void should_refetch_when_db_episode_has_screenshot_and_refetch_enabled()
        {
            Mocker.GetMock<IConfigService>()
                .SetupGet(c => c.TpdbApiKey)
                .Returns("test-key");

            Mocker.GetMock<IConfigService>()
                .SetupGet(c => c.TpdbRefetchThumbnails)
                .Returns(true);

            Mocker.GetMock<ITpdbSceneClient>()
                .Setup(c => c.GetScreenshotUrl(123))
                .Returns("https://example.com/new.jpg");

            var remoteEpisode = CreateEpisode(123);
            var existingEpisode = CreateEpisode(123);
            existingEpisode.Images.Add(new MediaCover.MediaCover(MediaCoverTypes.Screenshot, "https://example.com/existing.jpg"));

            Subject.Enrich(new List<Episode> { remoteEpisode }, new List<Episode> { existingEpisode });

            Mocker.GetMock<ITpdbSceneClient>().Verify(c => c.GetScreenshotUrl(123), Times.Once);
            remoteEpisode.Images.Should().ContainSingle(i =>
                i.CoverType == MediaCoverTypes.Screenshot &&
                i.RemoteUrl == "https://example.com/new.jpg");
        }

        [Test]
        public void should_not_throw_when_db_has_duplicate_tpdb_ids()
        {
            Mocker.GetMock<IConfigService>()
                .SetupGet(c => c.TpdbApiKey)
                .Returns("test-key");

            Mocker.GetMock<ITpdbSceneClient>()
                .Setup(c => c.GetScreenshotUrl(123))
                .Returns("https://example.com/scene.jpg");

            var remoteEpisode = CreateEpisode(123);
            var existingWithScreenshot = CreateEpisode(123);
            existingWithScreenshot.Images.Add(new MediaCover.MediaCover(MediaCoverTypes.Screenshot, "https://example.com/existing.jpg"));
            var duplicateExisting = CreateEpisode(123);

            Subject.Enrich(
                new List<Episode> { remoteEpisode },
                new List<Episode> { duplicateExisting, existingWithScreenshot });

            Mocker.GetMock<ITpdbSceneClient>().Verify(c => c.GetScreenshotUrl(It.IsAny<int>()), Times.Never);
            remoteEpisode.Images.Should().BeEmpty();
        }

        private static Episode CreateEpisode(int tvdbId)
        {
            return new Episode
            {
                TvdbId = tvdbId,
                Title = "Test Scene",
                SeasonNumber = 2020,
                AirDate = "2020-01-01"
            };
        }
    }
}
