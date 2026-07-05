using System.Collections.Generic;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Common.Http;
using NzbDrone.Common.Serializer;
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
        public void find_scene_by_stash_id_should_parse_response()
        {
            var json = Json.ToJson(new StashGraphQlResponse
            {
                Data = new StashGraphQlData
                {
                    FindScenes = new StashFindScenesResult
                    {
                        Count = 1,
                        Scenes = new List<StashScene>
                        {
                            new StashScene
                            {
                                Id = "1",
                                Title = "Test Scene",
                                Files = new List<StashSceneFile>
                                {
                                    new StashSceneFile { Path = "/data/file.mp4", Basename = "file.mp4" }
                                }
                            }
                        }
                    }
                }
            });

            Mocker.GetMock<IHttpClient>()
                .Setup(c => c.Post(It.IsAny<HttpRequest>()))
                .Returns<HttpRequest>(r => new HttpResponse(r, new HttpHeader(), json));

            var scene = Subject.FindSceneByStashId(_settings, "220b91d9-887d-4251-a252-cee7004733e7");

            scene.Should().NotBeNull();
            scene.Id.Should().Be("1");
            scene.Files.Should().HaveCount(1);
            scene.Files[0].Path.Should().Be("/data/file.mp4");
        }

        [Test]
        public void is_path_tracked_should_return_true_when_scene_found()
        {
            var json = Json.ToJson(new StashGraphQlResponse
            {
                Data = new StashGraphQlData
                {
                    FindScenes = new StashFindScenesResult
                    {
                        Count = 1,
                        Scenes = new List<StashScene>
                        {
                            new StashScene { Id = "1" }
                        }
                    }
                }
            });

            Mocker.GetMock<IHttpClient>()
                .Setup(c => c.Post(It.IsAny<HttpRequest>()))
                .Returns<HttpRequest>(r => new HttpResponse(r, new HttpHeader(), json));

            Subject.IsPathTracked(_settings, "/data/file.mp4").Should().BeTrue();
        }

        [Test]
        public void is_path_tracked_should_return_false_when_no_scene_found()
        {
            var json = Json.ToJson(new StashGraphQlResponse
            {
                Data = new StashGraphQlData
                {
                    FindScenes = new StashFindScenesResult
                    {
                        Count = 0,
                        Scenes = new List<StashScene>()
                    }
                }
            });

            Mocker.GetMock<IHttpClient>()
                .Setup(c => c.Post(It.IsAny<HttpRequest>()))
                .Returns<HttpRequest>(r => new HttpResponse(r, new HttpHeader(), json));

            Subject.IsPathTracked(_settings, "/data/missing.mp4").Should().BeFalse();
        }
    }
}
