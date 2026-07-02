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
