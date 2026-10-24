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
    public class StashProxyFixture : CoreTest<StashProxy>
    {
        private StashSettings _settings;

        [SetUp]
        public void Setup()
        {
            _settings = new StashSettings
            {
                Host = "localhost",
                Port = 9999,
                ApiKey = "test-key"
            };
        }

        [Test]
        public void update_should_submit_identify_in_separate_request_when_enabled()
        {
            var postCount = 0;

            _settings.MetadataIdentify = true;

            Mocker.GetMock<IHttpClient>()
                .Setup(c => c.Post(It.IsAny<HttpRequest>()))
                .Returns<HttpRequest>(r =>
                {
                    postCount++;
                    return new HttpResponse(r, new HttpHeader(), "{\"data\":{\"metadataScan\":\"1\"}}");
                });

            Subject.Update(_settings, "/data/studio/scene.mp4");

            postCount.Should().Be(2);
        }

        [Test]
        public void find_tpdb_scenes_should_query_stash_ids_and_parse_them()
        {
            var json = "{\"data\":{\"findScenes\":{\"count\":1,\"scenes\":[{\"id\":\"9\",\"title\":\"Scene\",\"files\":[{\"path\":\"/data/scene.mp4\",\"basename\":\"scene.mp4\"}],\"stash_ids\":[{\"endpoint\":\"https://theporndb.net/graphql\",\"stash_id\":\"520677d4-7436-4f5a-9b66-d3e1ebc23687\"}]}]}}}";
            string content = null;

            Mocker.GetMock<IHttpClient>()
                .Setup(c => c.Post(It.IsAny<HttpRequest>()))
                .Callback<HttpRequest>(r => content = r.ContentData != null ? Encoding.UTF8.GetString(r.ContentData) : string.Empty)
                .Returns<HttpRequest>(r => new HttpResponse(r, new HttpHeader(), json));

            var result = Subject.FindTpdbScenes(_settings, 1, 100);

            content.Should().Contain("NOT_NULL");
            content.Should().Contain(StashProxy.TpdbEndpoint);
            result.Count.Should().Be(1);
            result.Scenes.Should().ContainSingle();
            result.Scenes[0].StashIds.Should().ContainSingle();
            result.Scenes[0].StashIds[0].StashId.Should().Be("520677d4-7436-4f5a-9b66-d3e1ebc23687");
            result.Scenes[0].Files[0].Path.Should().Be("/data/scene.mp4");
        }
    }
}
