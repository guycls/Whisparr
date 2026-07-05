using System.Text;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Common.Http;
using NzbDrone.Core.Notifications.Stash;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.NotificationTests.Stash
{
    [TestFixture]
    public class StashServiceFixture : CoreTest
    {
        private Mock<IHttpClient> _httpClientMock;
        private StashService _subject;
        private string _capturedContent;

        [SetUp]
        public void Setup()
        {
            _httpClientMock = new Mock<IHttpClient>();
            _httpClientMock.Setup(c => c.Post(It.IsAny<HttpRequest>()))
                .Returns<HttpRequest>(r =>
                {
                    _capturedContent = Encoding.UTF8.GetString(r.ContentData);
                    return new HttpResponse(r, new HttpHeader(), "{}");
                });

            var proxy = new StashProxy(_httpClientMock.Object, Mocker.Resolve<NLog.Logger>());
            _subject = new StashService(proxy, Mocker.Resolve<NLog.Logger>());
        }

        [Test]
        public void update_should_map_and_forward_file_path()
        {
            var settings = new StashSettings
            {
                Host = "localhost",
                Port = 9999,
                MapFrom = "/data/whisparr",
                MapTo = "/stash/library"
            };

            _subject.Update(settings, "/data/whisparr/Series/scene.mp4");

            _capturedContent.Should().Contain("/stash/library/Series/scene.mp4");
            _httpClientMock.Verify(c => c.Post(It.IsAny<HttpRequest>()), Times.Once);
        }

        [Test]
        public void update_should_not_call_proxy_for_empty_path()
        {
            _subject.Update(new StashSettings { Host = "localhost", Port = 9999 }, null);
            _subject.Update(new StashSettings { Host = "localhost", Port = 9999 }, string.Empty);

            _httpClientMock.Verify(c => c.Post(It.IsAny<HttpRequest>()), Times.Never);
        }
    }
}
