using System.Collections.Generic;
using FizzWare.NBuilder;
using FluentAssertions;
using Moq;
using NLog;
using NUnit.Framework;
using NzbDrone.Common.Disk;
using NzbDrone.Common.Http;
using NzbDrone.Common.Serializer;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.MediaFiles;
using NzbDrone.Core.MediaFiles.EpisodeImport.Manual;
using NzbDrone.Core.MetadataSource.ThePornDb;
using NzbDrone.Core.Notifications;
using NzbDrone.Core.Notifications.Stash;
using NzbDrone.Core.Test.Framework;
using NzbDrone.Core.Tv;

namespace NzbDrone.Core.Test.NotificationTests.Stash
{
    [TestFixture]
    public class StashSyncServiceFixture : CoreTest
    {
        private StashSettings _stashSettings;
        private NotificationDefinition _stashDefinition;
        private Mock<INotificationFactory> _notificationFactoryMock;
        private Mock<IConfigService> _configServiceMock;
        private Mock<IEpisodeRepository> _episodeRepositoryMock;
        private Mock<ITpdbSceneClient> _tpdbSceneClientMock;
        private StashSyncService _subject;

        [SetUp]
        public void Setup()
        {
            _stashSettings = new StashSettings
            {
                Host = "localhost",
                Port = 9999,
                ApiKey = "test-key"
            };

            _stashDefinition = new NotificationDefinition
            {
                Id = 1,
                Name = "Stash",
                Implementation = "Stash",
                OnDownload = true,
                Settings = _stashSettings
            };

            _notificationFactoryMock = new Mock<INotificationFactory>();
            _notificationFactoryMock.Setup(f => f.All())
                .Returns(() => new List<NotificationDefinition> { _stashDefinition });

            _configServiceMock = new Mock<IConfigService>();
            _configServiceMock.SetupGet(c => c.TpdbApiKey).Returns("test-api-key");

            _episodeRepositoryMock = new Mock<IEpisodeRepository>();
            _tpdbSceneClientMock = new Mock<ITpdbSceneClient>();

            _subject = new StashSyncService(
                _notificationFactoryMock.Object,
                _episodeRepositoryMock.Object,
                Mocker.Resolve<ISeriesService>(),
                Mocker.Resolve<IMediaFileService>(),
                _tpdbSceneClientMock.Object,
                _configServiceMock.Object,
                Mocker.Resolve<StashProxy>(),
                Mocker.Resolve<IDiskProvider>(),
                Mocker.Resolve<ManualImportService>(),
                Mocker.Resolve<Logger>());
        }

        [Test]
        public void should_abort_when_tpdb_api_key_missing()
        {
            _configServiceMock.SetupGet(c => c.TpdbApiKey).Returns(string.Empty);

            var result = _subject.Sync(null);

            result.Imported.Should().Be(0);
            result.Scanned.Should().Be(0);
            _notificationFactoryMock.Verify(f => f.All(), Times.Never);
        }

        [Test]
        public void should_abort_when_no_stash_connection()
        {
            _notificationFactoryMock.Setup(f => f.All())
                .Returns(new List<NotificationDefinition>());

            var result = _subject.Sync(null);

            result.Imported.Should().Be(0);
            result.Scanned.Should().Be(0);
            _tpdbSceneClientMock.Verify(c => c.GetSceneUuid(It.IsAny<int>()), Times.Never);
        }

        [Test]
        public void should_sync_with_stash_connection_without_notification_triggers()
        {
            _stashDefinition.OnDownload = false;
            _episodeRepositoryMock.Setup(r => r.All()).Returns(new List<Episode>());

            var result = _subject.Sync(null);

            _notificationFactoryMock.Verify(f => f.All(), Times.Once);
            _tpdbSceneClientMock.Verify(c => c.GetSceneUuid(It.IsAny<int>()), Times.Never);
        }

        [Test]
        public void should_skip_monitored_episode_when_stash_has_no_match()
        {
            var episode = Builder<Episode>.CreateNew()
                .With(e => e.Id = 10)
                .With(e => e.SeriesId = 1)
                .With(e => e.Monitored = true)
                .With(e => e.EpisodeFileId = 0)
                .With(e => e.TvdbId = 12345)
                .Build();

            _episodeRepositoryMock.Setup(r => r.All()).Returns(new List<Episode> { episode });
            _tpdbSceneClientMock.Setup(c => c.GetSceneUuid(12345)).Returns((string)null);

            var result = _subject.Sync(null);

            result.Skipped.Should().BeGreaterOrEqualTo(1);
            result.Imported.Should().Be(0);
        }

        [Test]
        public void should_trigger_stash_scan_for_untracked_file()
        {
            var episode = Builder<Episode>.CreateNew()
                .With(e => e.Id = 10)
                .With(e => e.SeriesId = 1)
                .With(e => e.EpisodeFileId = 5)
                .With(e => e.TvdbId = 12345)
                .Build();

            var series = Builder<Series>.CreateNew()
                .With(s => s.Id = 1)
                .With(s => s.Path = "/data/whisparr/Series")
                .Build();

            var episodeFile = Builder<EpisodeFile>.CreateNew()
                .With(f => f.Id = 5)
                .With(f => f.RelativePath = "scene.mp4")
                .Build();

            _episodeRepositoryMock.Setup(r => r.All()).Returns(new List<Episode> { episode });

            var seriesServiceMock = new Mock<ISeriesService>();
            seriesServiceMock.Setup(s => s.GetSeries(1)).Returns(series);

            var mediaFileServiceMock = new Mock<IMediaFileService>();
            mediaFileServiceMock.Setup(m => m.Get(5)).Returns(episodeFile);

            var httpClientMock = new Mock<IHttpClient>();
            var untrackedPathJson = Json.ToJson(new StashGraphQlResponse
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

            var scanResponseJson = "{ \"data\": { \"metadataScan\": { \"id\": \"1\" } } }";
            var postCount = 0;

            httpClientMock.Setup(c => c.Post(It.IsAny<HttpRequest>()))
                .Returns<HttpRequest>(r =>
                {
                    postCount++;
                    var content = r.ContentData != null ?
                        System.Text.Encoding.UTF8.GetString(r.ContentData) :
                        string.Empty;

                    if (content.Contains("findScenes"))
                    {
                        return new HttpResponse(r, new HttpHeader(), untrackedPathJson);
                    }

                    return new HttpResponse(r, new HttpHeader(), scanResponseJson);
                });

            var subject = new StashSyncService(
                _notificationFactoryMock.Object,
                _episodeRepositoryMock.Object,
                seriesServiceMock.Object,
                mediaFileServiceMock.Object,
                _tpdbSceneClientMock.Object,
                _configServiceMock.Object,
                new StashProxy(httpClientMock.Object, Mocker.Resolve<Logger>()),
                Mocker.Resolve<IDiskProvider>(),
                Mocker.Resolve<ManualImportService>(),
                Mocker.Resolve<Logger>());

            var result = subject.Sync(null);

            result.Scanned.Should().Be(1);
            postCount.Should().BeGreaterOrEqualTo(2);
        }
    }
}
