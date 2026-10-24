using System.Collections.Generic;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Common.Disk;
using NzbDrone.Common.Http;
using NzbDrone.Common.Serializer;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.MediaFiles.EpisodeImport;
using NzbDrone.Core.MediaFiles.EpisodeImport.Manual;
using NzbDrone.Core.Messaging.Commands;
using NzbDrone.Core.MetadataSource.ThePornDb;
using NzbDrone.Core.Notifications;
using NzbDrone.Core.Notifications.Stash;
using NzbDrone.Core.Test.Framework;
using NzbDrone.Core.Tv;
using NzbDrone.Core.Tv.Commands;

namespace NzbDrone.Core.Test.NotificationTests.Stash
{
    [TestFixture]
    public class StashFullImportServiceFixture : CoreTest<StashFullImportService>
    {
        private StashSettings _stashSettings;
        private Series _series;
        private Episode _episode;
        private List<string> _actions;

        [SetUp]
        public void Setup()
        {
            _actions = new List<string>();

            _stashSettings = new StashSettings
            {
                Host = "localhost",
                Port = 9999,
                ApiKey = "test-key",
                FullImportRootFolder = "/data/root",
                FullImportQualityProfileId = 3
            };

            _series = new Series
            {
                Id = 7,
                TvdbId = 55,
                Title = "Studio",
                Path = "/data/root/Studio"
            };

            _episode = new Episode
            {
                Id = 10,
                SeriesId = 7,
                TvdbId = 123,
                EpisodeFileId = 0,
                Monitored = true
            };

            Mocker.GetMock<IConfigService>()
                .SetupGet(c => c.TpdbApiKey)
                .Returns("test-api-key");

            Mocker.GetMock<INotificationFactory>()
                .Setup(f => f.All())
                .Returns(new List<NotificationDefinition>
                {
                    new NotificationDefinition
                    {
                        Id = 1,
                        Name = "Stash",
                        Implementation = "Stash",
                        Settings = _stashSettings
                    }
                });

            Mocker.GetMock<IAddSeriesService>()
                .Setup(s => s.AddSeries(It.IsAny<Series>()))
                .Callback<Series>(series => _actions.Add("add"))
                .Returns<Series>(series =>
                {
                    series.Id = _series.Id;
                    series.Path = _series.Path;
                    series.Title = _series.Title;
                    return series;
                });

            Mocker.GetMock<IExecute<RefreshSeriesCommand>>()
                .Setup(s => s.Execute(It.IsAny<RefreshSeriesCommand>()))
                .Callback<RefreshSeriesCommand>(command => _actions.Add(command.IsNewSeries ? "refresh-new" : "refresh"));

            Mocker.GetMock<IExecute<ManualImportCommand>>()
                .Setup(s => s.Execute(It.IsAny<ManualImportCommand>()))
                .Callback<ManualImportCommand>(_ => _actions.Add("import"));

            Mocker.GetMock<IEpisodeService>()
                .Setup(s => s.GetEpisodeBySeries(_series.Id))
                .Returns(new List<Episode> { _episode });
        }

        [Test]
        public void should_abort_when_tpdb_api_key_missing()
        {
            Mocker.GetMock<IConfigService>().SetupGet(c => c.TpdbApiKey).Returns(string.Empty);

            var result = Subject.Import();

            result.StudiosAdded.Should().Be(0);
            result.Imported.Should().Be(0);
            Mocker.GetMock<INotificationFactory>().Verify(f => f.All(), Times.Never);
        }

        [Test]
        public void should_abort_when_no_stash_connection()
        {
            Mocker.GetMock<INotificationFactory>()
                .Setup(f => f.All())
                .Returns(new List<NotificationDefinition>());

            var result = Subject.Import();

            result.StudiosAdded.Should().Be(0);
            result.Imported.Should().Be(0);
            Mocker.GetMock<ITpdbSceneClient>().Verify(c => c.GetSceneByUuid(It.IsAny<string>()), Times.Never);
        }

        [Test]
        public void should_add_and_refresh_missing_studio_before_import()
        {
            SetupStashScene();
            Mocker.GetMock<ITpdbSceneClient>()
                .Setup(c => c.GetSceneByUuid("520677d4-7436-4f5a-9b66-d3e1ebc23687"))
                .Returns(new TpdbSceneReference { SceneId = 123, SiteId = 55, Title = "Scene" });
            Mocker.GetMock<ISeriesService>()
                .Setup(s => s.FindByTvdbId(55))
                .Returns((Series)null);
            SetupFile("/data/stash/scene.mp4");

            var result = Subject.Import();

            result.StudiosAdded.Should().Be(1);
            result.Imported.Should().Be(1);
            result.Failed.Should().Be(0);
            _actions.Should().Equal("add", "refresh-new", "import");

            Mocker.GetMock<IAddSeriesService>().Verify(s => s.AddSeries(It.Is<Series>(series =>
                series.TvdbId == 55 &&
                series.Monitored &&
                series.MonitorNewItems == NewItemMonitorTypes.None &&
                series.RootFolderPath == "/data/root" &&
                series.QualityProfileId == 3 &&
                series.AddOptions.SearchForMissingEpisodes == false &&
                series.AddOptions.SearchForCutoffUnmetEpisodes == false &&
                series.AddOptions.EpisodesToMonitor.Contains(123))));

            Mocker.GetMock<IExecute<RefreshSeriesCommand>>().Verify(s => s.Execute(It.Is<RefreshSeriesCommand>(command =>
                command.IsNewSeries &&
                command.SeriesIds.Contains(_series.Id))));

            Mocker.GetMock<IExecute<ManualImportCommand>>().Verify(s => s.Execute(It.Is<ManualImportCommand>(command =>
                command.ImportMode == ImportMode.Auto &&
                command.Files.Count == 1 &&
                command.Files[0].Path == "/data/stash/scene.mp4" &&
                command.Files[0].SeriesId == _series.Id &&
                command.Files[0].EpisodeIds.Contains(_episode.Id))));
        }

        [Test]
        public void should_import_into_existing_studio_without_adding_it()
        {
            SetupStashScene();
            Mocker.GetMock<ITpdbSceneClient>()
                .Setup(c => c.GetSceneByUuid("520677d4-7436-4f5a-9b66-d3e1ebc23687"))
                .Returns(new TpdbSceneReference { SceneId = 123, SiteId = 55, Title = "Scene" });
            Mocker.GetMock<ISeriesService>()
                .Setup(s => s.FindByTvdbId(55))
                .Returns(_series);
            SetupFile("/data/stash/scene.mp4");

            var result = Subject.Import();

            result.StudiosAdded.Should().Be(0);
            result.Imported.Should().Be(1);
            _actions.Should().Equal("import");
            Mocker.GetMock<IAddSeriesService>().Verify(s => s.AddSeries(It.IsAny<Series>()), Times.Never);
            Mocker.GetMock<IExecute<RefreshSeriesCommand>>().Verify(s => s.Execute(It.IsAny<RefreshSeriesCommand>()), Times.Never);
        }

        [Test]
        public void should_refresh_existing_studio_when_scene_is_missing()
        {
            SetupStashScene();
            Mocker.GetMock<ITpdbSceneClient>()
                .Setup(c => c.GetSceneByUuid("520677d4-7436-4f5a-9b66-d3e1ebc23687"))
                .Returns(new TpdbSceneReference { SceneId = 123, SiteId = 55, Title = "Scene" });
            Mocker.GetMock<ISeriesService>()
                .Setup(s => s.FindByTvdbId(55))
                .Returns(_series);

            var calls = 0;
            Mocker.GetMock<IEpisodeService>()
                .Setup(s => s.GetEpisodeBySeries(_series.Id))
                .Returns(() =>
                {
                    calls++;
                    return calls == 1 ? new List<Episode>() : new List<Episode> { _episode };
                });
            SetupFile("/data/stash/scene.mp4");

            var result = Subject.Import();

            result.StudiosAdded.Should().Be(0);
            result.Imported.Should().Be(1);
            _actions.Should().Equal("refresh", "import");
            Mocker.GetMock<IAddSeriesService>().Verify(s => s.AddSeries(It.IsAny<Series>()), Times.Never);
        }

        [Test]
        public void should_skip_scene_when_tpdb_cannot_resolve_it()
        {
            SetupStashScene();
            Mocker.GetMock<ITpdbSceneClient>()
                .Setup(c => c.GetSceneByUuid(It.IsAny<string>()))
                .Returns((TpdbSceneReference)null);

            var result = Subject.Import();

            result.Skipped.Should().BeGreaterOrEqualTo(1);
            result.Imported.Should().Be(0);
            result.StudiosAdded.Should().Be(0);
            Mocker.GetMock<IAddSeriesService>().Verify(s => s.AddSeries(It.IsAny<Series>()), Times.Never);
        }

        [Test]
        public void should_skip_scene_when_file_is_not_on_disk()
        {
            SetupStashScene();
            Mocker.GetMock<ITpdbSceneClient>()
                .Setup(c => c.GetSceneByUuid("520677d4-7436-4f5a-9b66-d3e1ebc23687"))
                .Returns(new TpdbSceneReference { SceneId = 123, SiteId = 55, Title = "Scene" });
            Mocker.GetMock<ISeriesService>()
                .Setup(s => s.FindByTvdbId(55))
                .Returns(_series);
            Mocker.GetMock<IDiskProvider>()
                .Setup(d => d.FileExists(It.IsAny<string>()))
                .Returns(false);

            var result = Subject.Import();

            result.Skipped.Should().BeGreaterOrEqualTo(1);
            result.Imported.Should().Be(0);
            Mocker.GetMock<IExecute<ManualImportCommand>>().Verify(s => s.Execute(It.IsAny<ManualImportCommand>()), Times.Never);
        }

        [Test]
        public void should_import_each_scene_before_resolving_the_next()
        {
            SetupStashScenes();
            Mocker.GetMock<ITpdbSceneClient>()
                .Setup(c => c.GetSceneByUuid(It.IsAny<string>()))
                .Returns<string>(uuid =>
                {
                    _actions.Add("resolve");
                    return uuid == "520677d4-7436-4f5a-9b66-d3e1ebc23687"
                        ? new TpdbSceneReference { SceneId = 123, SiteId = 55, Title = "Scene" }
                        : new TpdbSceneReference { SceneId = 456, SiteId = 55, Title = "Scene 2" };
                });
            Mocker.GetMock<ISeriesService>()
                .Setup(s => s.FindByTvdbId(55))
                .Returns((Series)null);
            Mocker.GetMock<IEpisodeService>()
                .Setup(s => s.GetEpisodeBySeries(_series.Id))
                .Returns(new List<Episode>
                {
                    _episode,
                    new Episode
                    {
                        Id = 11,
                        SeriesId = 7,
                        TvdbId = 456,
                        EpisodeFileId = 0,
                        Monitored = false
                    }
                });
            SetupFile("/data/stash/scene.mp4");
            SetupFile("/data/stash/scene2.mp4");

            var result = Subject.Import();

            result.StudiosAdded.Should().Be(1);
            result.Imported.Should().Be(2);
            result.Failed.Should().Be(0);
            _actions.Should().Equal("resolve", "add", "refresh-new", "import", "resolve", "import");
            Mocker.GetMock<IAddSeriesService>().Verify(s => s.AddSeries(It.IsAny<Series>()), Times.Once);
            Mocker.GetMock<IEpisodeService>().Verify(s => s.SetEpisodeMonitored(11, true), Times.Once);
        }

        [Test]
        public void should_fail_new_studio_when_root_folder_is_not_configured()
        {
            _stashSettings.FullImportRootFolder = null;
            _stashSettings.FullImportQualityProfileId = 0;
            SetupStashScene();
            Mocker.GetMock<ITpdbSceneClient>()
                .Setup(c => c.GetSceneByUuid("520677d4-7436-4f5a-9b66-d3e1ebc23687"))
                .Returns(new TpdbSceneReference { SceneId = 123, SiteId = 55, Title = "Scene" });
            Mocker.GetMock<ISeriesService>()
                .Setup(s => s.FindByTvdbId(55))
                .Returns((Series)null);

            var result = Subject.Import();

            result.Failed.Should().BeGreaterOrEqualTo(1);
            result.StudiosAdded.Should().Be(0);
            result.Imported.Should().Be(0);
            Mocker.GetMock<IAddSeriesService>().Verify(s => s.AddSeries(It.IsAny<Series>()), Times.Never);
        }

        private void SetupStashScenes()
        {
            var json = Json.ToJson(new StashGraphQlResponse
            {
                Data = new StashGraphQlData
                {
                    FindScenes = new StashFindScenesResult
                    {
                        Count = 2,
                        Scenes = new List<StashScene>
                        {
                            new StashScene
                            {
                                Id = "9",
                                Title = "Scene",
                                Files = new List<StashSceneFile>
                                {
                                    new StashSceneFile { Path = "/data/stash/scene.mp4", Basename = "scene.mp4" }
                                },
                                StashIds = new List<StashSceneStashId>
                                {
                                    new StashSceneStashId
                                    {
                                        Endpoint = StashProxy.TpdbEndpoint,
                                        StashId = "520677d4-7436-4f5a-9b66-d3e1ebc23687"
                                    }
                                }
                            },
                            new StashScene
                            {
                                Id = "10",
                                Title = "Scene 2",
                                Files = new List<StashSceneFile>
                                {
                                    new StashSceneFile { Path = "/data/stash/scene2.mp4", Basename = "scene2.mp4" }
                                },
                                StashIds = new List<StashSceneStashId>
                                {
                                    new StashSceneStashId
                                    {
                                        Endpoint = StashProxy.TpdbEndpoint,
                                        StashId = "aaaaaaaa-7436-4f5a-9b66-d3e1ebc23687"
                                    }
                                }
                            }
                        }
                    }
                }
            });

            Mocker.GetMock<IHttpClient>()
                .Setup(c => c.Post(It.IsAny<HttpRequest>()))
                .Returns<HttpRequest>(r => new HttpResponse(r, new HttpHeader(), json));
        }

        private void SetupStashScene()
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
                                Id = "9",
                                Title = "Scene",
                                Files = new List<StashSceneFile>
                                {
                                    new StashSceneFile { Path = "/data/stash/scene.mp4", Basename = "scene.mp4" }
                                },
                                StashIds = new List<StashSceneStashId>
                                {
                                    new StashSceneStashId
                                    {
                                        Endpoint = StashProxy.TpdbEndpoint,
                                        StashId = "520677d4-7436-4f5a-9b66-d3e1ebc23687"
                                    }
                                }
                            }
                        }
                    }
                }
            });

            Mocker.GetMock<IHttpClient>()
                .Setup(c => c.Post(It.IsAny<HttpRequest>()))
                .Returns<HttpRequest>(r => new HttpResponse(r, new HttpHeader(), json));
        }

        private void SetupFile(string path)
        {
            Mocker.GetMock<IDiskProvider>()
                .Setup(d => d.FileExists(path))
                .Returns(true);
            Mocker.GetMock<IDiskProvider>()
                .Setup(d => d.GetFileSize(path))
                .Returns(1000);
        }
    }
}
