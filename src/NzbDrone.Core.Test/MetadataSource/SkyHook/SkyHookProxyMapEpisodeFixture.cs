using System.Collections.Generic;
using System.Linq;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Common.Http;
using NzbDrone.Common.Serializer;
using NzbDrone.Core.MediaCover;
using NzbDrone.Core.MetadataSource.SkyHook;
using NzbDrone.Core.MetadataSource.SkyHook.Resource;
using NzbDrone.Core.Test.Framework;
using NzbDrone.Core.Tv;

namespace NzbDrone.Core.Test.MetadataSource.SkyHook
{
    [TestFixture]
    public class SkyHookProxyMapEpisodeFixture : CoreTest<SkyHookProxy>
    {
        [Test]
        public void should_map_image_field_when_present()
        {
            SetupShowResponse(CreateEpisodeResource(image: "https://example.com/image-field.jpg"));

            var episodes = Subject.GetSeriesInfo(1).Item2;

            episodes.Should().ContainSingle();
            episodes.First().Images.Should().ContainSingle(i =>
                i.CoverType == MediaCoverTypes.Screenshot &&
                i.RemoteUrl == "https://example.com/image-field.jpg");
        }

        [Test]
        public void should_map_images_array_screenshot_when_image_field_missing()
        {
            SetupShowResponse(CreateEpisodeResource(
                images: new List<ImageResource>
                {
                    new ImageResource { CoverType = "screenshot", Url = "https://example.com/screenshot.jpg" }
                }));

            var episodes = Subject.GetSeriesInfo(1).Item2;

            episodes.Should().ContainSingle();
            episodes.First().Images.Should().ContainSingle(i =>
                i.CoverType == MediaCoverTypes.Screenshot &&
                i.RemoteUrl == "https://example.com/screenshot.jpg");
        }

        [Test]
        public void should_prefer_image_field_over_images_array()
        {
            SetupShowResponse(CreateEpisodeResource(
                image: "https://example.com/image-field.jpg",
                images: new List<ImageResource>
                {
                    new ImageResource { CoverType = "screenshot", Url = "https://example.com/screenshot.jpg" }
                }));

            var episodes = Subject.GetSeriesInfo(1).Item2;

            episodes.First().Images.Should().ContainSingle(i => i.RemoteUrl == "https://example.com/image-field.jpg");
        }

        private static EpisodeResource CreateEpisodeResource(string image = null, List<ImageResource> images = null)
        {
            return new EpisodeResource
            {
                ForeignId = 3188328,
                Year = 2020,
                Title = "Test Scene",
                ReleaseDate = "2020-01-01",
                Image = image,
                Images = images ?? new List<ImageResource>()
            };
        }

        private void SetupShowResponse(EpisodeResource episodeResource)
        {
            var show = new ShowResource
            {
                ForeignId = 1,
                Title = "Test Site",
                Network = "Network",
                Slug = "test-site",
                Genres = new List<string>(),
                Images = new List<ImageResource>
                {
                    new ImageResource { CoverType = "poster", Url = "https://example.com/poster.jpg" }
                },
                Episodes = new List<EpisodeResource> { episodeResource }
            };

            var json = Json.ToJson(show);

            Mocker.GetMock<IHttpClient>()
                .Setup(c => c.Get<ShowResource>(It.IsAny<HttpRequest>()))
                .Returns<HttpRequest>(r => new HttpResponse<ShowResource>(new HttpResponse(r, new HttpHeader(), json)));
        }
    }
}
