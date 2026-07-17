using System.Collections.Generic;
using System.Linq;
using FizzWare.NBuilder;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Common.Disk;
using NzbDrone.Core.DecisionEngine;
using NzbDrone.Core.Download;
using NzbDrone.Core.Download.History;
using NzbDrone.Core.Download.TrackedDownloads;
using NzbDrone.Core.History;
using NzbDrone.Core.MediaFiles;
using NzbDrone.Core.MediaFiles.EpisodeImport;
using NzbDrone.Core.Messaging.Events;
using NzbDrone.Core.Parser;
using NzbDrone.Core.Parser.Model;
using NzbDrone.Core.SiteRip;
using NzbDrone.Core.Test.Framework;
using NzbDrone.Core.Tv;
using NzbDrone.Test.Common;

namespace NzbDrone.Core.Test.Download.CompletedDownloadServiceTests
{
    [TestFixture]
    public class ImportFixture : CoreTest<CompletedDownloadService>
    {
        private TrackedDownload _trackedDownload;
        private Episode _episode1;
        private Episode _episode2;
        private Episode _episode3;

        [SetUp]
        public void Setup()
        {
            _episode1 = new Episode { Id = 1, SeasonNumber = 1 };
            _episode2 = new Episode { Id = 2, SeasonNumber = 1 };
            _episode3 = new Episode { Id = 2, SeasonNumber = 1 };

            var completed = Builder<DownloadClientItem>.CreateNew()
                                                    .With(h => h.Status = DownloadItemStatus.Completed)
                                                    .With(h => h.OutputPath = new OsPath(@"C:\DropFolder\MyDownload".AsOsAgnostic()))
                                                    .With(h => h.Title = "Drone.S01E01.HDTV")
                                                    .Build();

            var remoteEpisode = BuildRemoteEpisode();

            _trackedDownload = Builder<TrackedDownload>.CreateNew()
                    .With(c => c.State = TrackedDownloadState.Downloading)
                    .With(c => c.DownloadItem = completed)
                    .With(c => c.RemoteEpisode = remoteEpisode)
                    .Build();

            Mocker.GetMock<IDownloadClient>()
              .SetupGet(c => c.Definition)
              .Returns(new DownloadClientDefinition { Id = 1, Name = "testClient" });

            Mocker.GetMock<IProvideDownloadClient>()
                  .Setup(c => c.Get(It.IsAny<int>()))
                  .Returns(Mocker.GetMock<IDownloadClient>().Object);

            Mocker.GetMock<IHistoryService>()
                  .Setup(s => s.MostRecentForDownloadId(_trackedDownload.DownloadItem.DownloadId))
                  .Returns(new EpisodeHistory());

            Mocker.GetMock<IParsingService>()
                  .Setup(s => s.GetSeries("Drone.S01E01.HDTV"))
                  .Returns(remoteEpisode.Series);

            Mocker.GetMock<IHistoryService>()
                  .Setup(s => s.FindByDownloadId(It.IsAny<string>()))
                  .Returns(new List<EpisodeHistory>());

            Mocker.GetMock<IProvideImportItemService>()
                  .Setup(s => s.ProvideImportItem(It.IsAny<DownloadClientItem>(), It.IsAny<DownloadClientItem>()))
                  .Returns<DownloadClientItem, DownloadClientItem>((i, p) => i);

            Mocker.GetMock<IEpisodeService>()
                .Setup(s => s.GetEpisodes(It.IsAny<IEnumerable<int>>()))
                .Returns(new List<Episode>());

            Mocker.GetMock<IDownloadHistoryService>()
                  .Setup(s => s.DownloadAlreadyImported(It.IsAny<string>()))
                  .Returns(false);
        }

        private RemoteEpisode BuildRemoteEpisode()
        {
            return new RemoteEpisode
            {
                Series = new Series(),
                Episodes = new List<Episode>
                {
                    _episode1
                }
            };
        }

        private void GivenABadlyNamedDownload()
        {
            _trackedDownload.DownloadItem.DownloadId = "1234";
            _trackedDownload.DownloadItem.Title = "Droned Pilot"; // Set a badly named download
            Mocker.GetMock<IHistoryService>()
               .Setup(s => s.MostRecentForDownloadId(It.Is<string>(i => i == "1234")))
               .Returns(new EpisodeHistory() { SourceTitle = "Droned S01E01" });

            Mocker.GetMock<IParsingService>()
               .Setup(s => s.GetSeries(It.IsAny<string>()))
               .Returns((Series)null);

            Mocker.GetMock<IParsingService>()
                .Setup(s => s.GetSeries("Droned S01E01"))
                .Returns(BuildRemoteEpisode().Series);
        }

        private void GivenSeriesMatch()
        {
            Mocker.GetMock<IParsingService>()
                  .Setup(s => s.GetSeries(It.IsAny<string>()))
                  .Returns(_trackedDownload.RemoteEpisode.Series);
        }

        [Test]
        public void should_not_mark_as_imported_if_all_files_were_rejected()
        {
            Mocker.GetMock<IDownloadedEpisodesImportService>()
                  .Setup(v => v.ProcessPath(It.IsAny<string>(), It.IsAny<ImportMode>(), It.IsAny<Series>(), It.IsAny<DownloadClientItem>(), It.IsAny<List<int>>()))
                  .Returns(new List<ImportResult>
                           {
                               new ImportResult(
                                   new ImportDecision(
                                       new LocalEpisode { Path = @"C:\TestPath\Droned.S01E01.mkv", Episodes = { _episode1 } }, new Rejection("Rejected!")), "Test Failure"),

                               new ImportResult(
                                   new ImportDecision(
                                       new LocalEpisode { Path = @"C:\TestPath\Droned.S01E02.mkv", Episodes = { _episode2 } }, new Rejection("Rejected!")), "Test Failure")
                           });

            Subject.Import(_trackedDownload);

            Mocker.GetMock<IEventAggregator>()
                .Verify(v => v.PublishEvent<DownloadCompletedEvent>(It.IsAny<DownloadCompletedEvent>()), Times.Never());

            AssertNotImported();
        }

        [Test]
        public void should_not_mark_as_imported_if_no_episodes_were_parsed()
        {
            Mocker.GetMock<IDownloadedEpisodesImportService>()
                  .Setup(v => v.ProcessPath(It.IsAny<string>(), It.IsAny<ImportMode>(), It.IsAny<Series>(), It.IsAny<DownloadClientItem>(), It.IsAny<List<int>>()))
                  .Returns(new List<ImportResult>
                           {
                               new ImportResult(
                                   new ImportDecision(
                                       new LocalEpisode { Path = @"C:\TestPath\Droned.S01E01.mkv", Episodes = { _episode1 } }, new Rejection("Rejected!")), "Test Failure"),

                               new ImportResult(
                                   new ImportDecision(
                                       new LocalEpisode { Path = @"C:\TestPath\Droned.S01E02.mkv", Episodes = { _episode2 } }, new Rejection("Rejected!")), "Test Failure")
                           });

            _trackedDownload.RemoteEpisode.Episodes.Clear();

            Subject.Import(_trackedDownload);

            AssertNotImported();
        }

        [Test]
        public void should_not_mark_as_imported_if_all_files_were_skipped()
        {
            Mocker.GetMock<IDownloadedEpisodesImportService>()
                  .Setup(v => v.ProcessPath(It.IsAny<string>(), It.IsAny<ImportMode>(), It.IsAny<Series>(), It.IsAny<DownloadClientItem>(), It.IsAny<List<int>>()))
                  .Returns(new List<ImportResult>
                           {
                               new ImportResult(new ImportDecision(new LocalEpisode { Path = @"C:\TestPath\Droned.S01E01.mkv", Episodes = { _episode1 } }), "Test Failure"),
                               new ImportResult(new ImportDecision(new LocalEpisode { Path = @"C:\TestPath\Droned.S01E02.mkv", Episodes = { _episode2 } }), "Test Failure")
                           });

            Subject.Import(_trackedDownload);

            AssertNotImported();
        }

        [Test]
        public void should_not_mark_as_imported_if_some_of_episodes_were_not_imported()
        {
            _trackedDownload.RemoteEpisode.Episodes = new List<Episode>
            {
                new Episode(),
                new Episode(),
                new Episode()
            };

            Mocker.GetMock<IDownloadedEpisodesImportService>()
                  .Setup(v => v.ProcessPath(It.IsAny<string>(), It.IsAny<ImportMode>(), It.IsAny<Series>(), It.IsAny<DownloadClientItem>(), It.IsAny<List<int>>()))
                  .Returns(new List<ImportResult>
                           {
                               new ImportResult(new ImportDecision(new LocalEpisode { Path = @"C:\TestPath\Droned.S01E01.mkv" })),
                               new ImportResult(new ImportDecision(new LocalEpisode { Path = @"C:\TestPath\Droned.S01E01.mkv" }), "Test Failure"),
                               new ImportResult(new ImportDecision(new LocalEpisode { Path = @"C:\TestPath\Droned.S01E01.mkv" }), "Test Failure")
                           });

            Mocker.GetMock<IHistoryService>()
                  .Setup(s => s.FindByDownloadId(It.IsAny<string>()))
                  .Returns(new List<EpisodeHistory>());

            Subject.Import(_trackedDownload);

            AssertNotImported();
        }

        [Test]
        public void should_not_mark_as_imported_if_some_of_episodes_were_not_imported_including_history()
        {
            _trackedDownload.RemoteEpisode.Episodes = new List<Episode>
                                                      {
                                                          new Episode(),
                                                          new Episode(),
                                                          new Episode()
                                                      };

            Mocker.GetMock<IDownloadedEpisodesImportService>()
                  .Setup(v => v.ProcessPath(It.IsAny<string>(), It.IsAny<ImportMode>(), It.IsAny<Series>(), It.IsAny<DownloadClientItem>(), It.IsAny<List<int>>()))
                  .Returns(new List<ImportResult>
                           {
                               new ImportResult(new ImportDecision(new LocalEpisode { Path = @"C:\TestPath\Droned.S01E01.mkv" })),
                               new ImportResult(new ImportDecision(new LocalEpisode { Path = @"C:\TestPath\Droned.S01E01.mkv" }), "Test Failure"),
                               new ImportResult(new ImportDecision(new LocalEpisode { Path = @"C:\TestPath\Droned.S01E01.mkv" }), "Test Failure")
                           });

            var history = Builder<EpisodeHistory>.CreateListOfSize(2)
                                                  .BuildList();

            Mocker.GetMock<IHistoryService>()
                  .Setup(s => s.FindByDownloadId(It.IsAny<string>()))
                  .Returns(history);

            Mocker.GetMock<ITrackedDownloadAlreadyImported>()
                  .Setup(s => s.IsImported(_trackedDownload, history))
                  .Returns(true);

            Subject.Import(_trackedDownload);

            AssertNotImported();
        }

        [Test]
        public void should_mark_as_imported_if_all_episodes_were_imported()
        {
            var episode1 = new Episode { Id = 1 };
            var episode2 = new Episode { Id = 2 };
            _trackedDownload.RemoteEpisode.Episodes = new List<Episode> { episode1, episode2 };

            Mocker.GetMock<IDownloadedEpisodesImportService>()
                  .Setup(v => v.ProcessPath(It.IsAny<string>(), It.IsAny<ImportMode>(), It.IsAny<Series>(), It.IsAny<DownloadClientItem>(), It.IsAny<List<int>>()))
                  .Returns(new List<ImportResult>
                           {
                               new ImportResult(
                                   new ImportDecision(
                                       new LocalEpisode { Path = @"C:\TestPath\Droned.S01E01.mkv", Episodes = new List<Episode> { episode1 } })),

                               new ImportResult(
                                   new ImportDecision(
                                       new LocalEpisode { Path = @"C:\TestPath\Droned.S01E02.mkv", Episodes = new List<Episode> { episode2 } }))
                           });

            Subject.Import(_trackedDownload);

            AssertImported();
        }

        [Test]
        public void should_mark_as_imported_if_all_episodes_were_imported_including_history()
        {
            var episode1 = new Episode { Id = 1 };
            var episode2 = new Episode { Id = 2 };
            _trackedDownload.RemoteEpisode.Episodes = new List<Episode> { episode1, episode2 };

            Mocker.GetMock<IDownloadedEpisodesImportService>()
                .Setup(v => v.ProcessPath(It.IsAny<string>(), It.IsAny<ImportMode>(), It.IsAny<Series>(), It.IsAny<DownloadClientItem>(), It.IsAny<List<int>>()))
                .Returns(new List<ImportResult>
                {
                    new ImportResult(
                        new ImportDecision(
                            new LocalEpisode { Path = @"C:\TestPath\Droned.S01E01.mkv", Episodes = new List<Episode> { episode1 } })),

                    new ImportResult(
                        new ImportDecision(
                            new LocalEpisode { Path = @"C:\TestPath\Droned.S01E02.mkv", Episodes = new List<Episode> { episode2 } }), "Test Failure")
                });

            var history = Builder<EpisodeHistory>.CreateListOfSize(2)
                                                  .BuildList();

            Mocker.GetMock<IHistoryService>()
                  .Setup(s => s.FindByDownloadId(It.IsAny<string>()))
                  .Returns(history);

            Mocker.GetMock<ITrackedDownloadAlreadyImported>()
                  .Setup(s => s.IsImported(It.IsAny<TrackedDownload>(), It.IsAny<List<EpisodeHistory>>()))
                  .Returns(true);

            Subject.Import(_trackedDownload);

            AssertImported();
        }

        [Test]
        public void should_mark_as_imported_if_double_episode_file_is_imported()
        {
            var episode1 = new Episode { Id = 1 };
            var episode2 = new Episode { Id = 2 };
            _trackedDownload.RemoteEpisode.Episodes = new List<Episode> { episode1, episode2 };

            Mocker.GetMock<IDownloadedEpisodesImportService>()
                  .Setup(v => v.ProcessPath(It.IsAny<string>(), It.IsAny<ImportMode>(), It.IsAny<Series>(), It.IsAny<DownloadClientItem>(), It.IsAny<List<int>>()))
                  .Returns(new List<ImportResult>
                           {
                               new ImportResult(
                                   new ImportDecision(
                                       new LocalEpisode { Path = @"C:\TestPath\Droned.S01E01-E02.mkv", Episodes = new List<Episode> { episode1, episode2 } }))
                           });

            Subject.Import(_trackedDownload);

            AssertImported();
        }

        [Test]
        public void should_mark_as_imported_if_all_episodes_were_imported_but_extra_files_were_not()
        {
            GivenSeriesMatch();

            _trackedDownload.RemoteEpisode.Episodes = new List<Episode>
                                                      {
                                                          new Episode()
                                                      };

            Mocker.GetMock<IDownloadedEpisodesImportService>()
                  .Setup(v => v.ProcessPath(It.IsAny<string>(), It.IsAny<ImportMode>(), It.IsAny<Series>(), It.IsAny<DownloadClientItem>(), It.IsAny<List<int>>()))
                  .Returns(new List<ImportResult>
                           {
                               new ImportResult(new ImportDecision(new LocalEpisode { Path = @"C:\TestPath\Droned.S01E01.mkv", Episodes = _trackedDownload.RemoteEpisode.Episodes })),
                               new ImportResult(new ImportDecision(new LocalEpisode { Path = @"C:\TestPath\Droned.S01E01.mkv" }), "Test Failure")
                           });

            Subject.Import(_trackedDownload);

            AssertImported();
        }

        [Test]
        public void should_mark_as_imported_if_the_download_can_be_tracked_using_the_source_seriesid()
        {
            GivenABadlyNamedDownload();

            Mocker.GetMock<IDownloadedEpisodesImportService>()
                  .Setup(v => v.ProcessPath(It.IsAny<string>(), It.IsAny<ImportMode>(), It.IsAny<Series>(), It.IsAny<DownloadClientItem>(), It.IsAny<List<int>>()))
                  .Returns(new List<ImportResult>
                           {
                               new ImportResult(new ImportDecision(new LocalEpisode { Path = @"C:\TestPath\Droned.S01E01.mkv", Episodes = _trackedDownload.RemoteEpisode.Episodes }))
                           });

            Mocker.GetMock<ISeriesService>()
                  .Setup(v => v.GetSeries(It.IsAny<int>()))
                  .Returns(BuildRemoteEpisode().Series);

            Subject.Import(_trackedDownload);

            AssertImported();
        }

        [Test]
        public void should_import_when_remote_episode_is_null_but_grab_history_exists()
        {
            const string downloadId = "60F906260C523946645C95610D80EDC33786F815";
            const int seriesId = 14;
            const int episodeId = 15101;

            _trackedDownload.DownloadItem.DownloadId = downloadId;
            _trackedDownload.DownloadItem.Title = "[Clips4Sale.com] Cory Chase - Son Cums of Age 1080p.mp4";
            _trackedDownload.RemoteEpisode = null;
            _trackedDownload.State = TrackedDownloadState.ImportPending;

            var episode = new Episode { Id = episodeId, SeriesId = seriesId };
            var series = new Series { Id = seriesId, Title = "Bare Back Studios" };
            var history = new List<EpisodeHistory>
            {
                new EpisodeHistory
                {
                    EpisodeId = episodeId,
                    EventType = EpisodeHistoryEventType.Grabbed,
                    Date = System.DateTime.UtcNow,
                    SeriesId = seriesId,
                    DownloadId = downloadId,
                    Data = new Dictionary<string, string>
                    {
                        [HistoryDataKeys.ReleaseSource] = ReleaseSourceType.InteractiveSearch.ToString()
                    }
                }
            };

            Mocker.GetMock<ISiteRipDownloadRepository>()
                  .Setup(r => r.FindByDownloadId(downloadId))
                  .Returns((SiteRipDownload)null);

            Mocker.GetMock<IHistoryService>()
                  .Setup(s => s.FindByDownloadId(downloadId))
                  .Returns(history);

            Mocker.GetMock<ISeriesService>()
                  .Setup(s => s.GetSeries(seriesId))
                  .Returns(series);

            Mocker.GetMock<IEpisodeService>()
                  .Setup(s => s.GetEpisodes(It.IsAny<IEnumerable<int>>()))
                  .Returns(new List<Episode> { episode });

            Mocker.GetMock<ITrackedDownloadAlreadyImported>()
                  .Setup(s => s.IsImported(It.IsAny<TrackedDownload>(), It.IsAny<List<EpisodeHistory>>()))
                  .Returns(false);

            Mocker.GetMock<IDownloadedEpisodesImportService>()
                  .Setup(v => v.ProcessPath(It.IsAny<string>(), It.IsAny<ImportMode>(), It.IsAny<Series>(), It.IsAny<DownloadClientItem>(), It.IsAny<List<int>>()))
                  .Returns(new List<ImportResult>
                  {
                      new ImportResult(new ImportDecision(new LocalEpisode
                      {
                          Path = @"C:\DropFolder\MyDownload\Cory.Chase.mp4".AsOsAgnostic(),
                          Episodes = new List<Episode> { episode }
                      }))
                  });

            Subject.Import(_trackedDownload);

            Mocker.GetMock<IDownloadedEpisodesImportService>()
                  .Verify(v => v.ProcessPath(It.IsAny<string>(), It.IsAny<ImportMode>(), series, It.IsAny<DownloadClientItem>(), It.IsAny<List<int>>()), Times.Once());

            _trackedDownload.RemoteEpisode.Should().NotBeNull();
            _trackedDownload.RemoteEpisode.Episodes.First().Id.Should().Be(episodeId);
            AssertImported();
        }

        [Test]
        public void should_mark_as_imported_when_remote_episode_is_null_but_history_shows_imported()
        {
            const string downloadId = "51BB4A283478B29E3281C22C251A0A21D53E4D6A";

            _trackedDownload.DownloadItem.DownloadId = downloadId;
            _trackedDownload.RemoteEpisode = null;
            _trackedDownload.State = TrackedDownloadState.ImportPending;

            var episode = new Episode { Id = 1, EpisodeFileId = 10, SeriesId = 5 };
            var history = new List<EpisodeHistory>
            {
                new EpisodeHistory { EpisodeId = 1, EventType = EpisodeHistoryEventType.DownloadFolderImported, Date = System.DateTime.UtcNow, SeriesId = 5, DownloadId = downloadId },
                new EpisodeHistory { EpisodeId = 1, EventType = EpisodeHistoryEventType.Grabbed, Date = System.DateTime.UtcNow.AddMinutes(-5), SeriesId = 5, DownloadId = downloadId }
            };

            Mocker.GetMock<ISiteRipDownloadRepository>()
                  .Setup(r => r.FindByDownloadId(downloadId))
                  .Returns((SiteRipDownload)null);

            Mocker.GetMock<IHistoryService>()
                  .Setup(s => s.FindByDownloadId(downloadId))
                  .Returns(history);

            Mocker.GetMock<IEpisodeService>()
                  .Setup(s => s.GetEpisodes(It.IsAny<IEnumerable<int>>()))
                  .Returns(new List<Episode> { episode });

            Mocker.GetMock<IMediaFileService>()
                  .Setup(s => s.GetFiles(It.IsAny<IEnumerable<int>>()))
                  .Returns(new List<EpisodeFile>());

            Mocker.GetMock<ITrackedDownloadAlreadyImported>()
                  .Setup(s => s.IsImported(It.IsAny<TrackedDownload>(), It.IsAny<List<EpisodeHistory>>()))
                  .Returns(true);

            Subject.Import(_trackedDownload);

            Mocker.GetMock<IDownloadedEpisodesImportService>()
                  .Verify(v => v.ProcessPath(It.IsAny<string>(), It.IsAny<ImportMode>(), It.IsAny<Series>(), It.IsAny<DownloadClientItem>(), It.IsAny<List<int>>()), Times.Never());

            Mocker.GetMock<IEventAggregator>()
                  .Verify(v => v.PublishEvent(It.IsAny<DownloadCompletedEvent>()), Times.Once());

            _trackedDownload.State.Should().Be(TrackedDownloadState.Imported);
        }

        [Test]
        public void should_not_publish_download_completed_when_remote_episode_is_null_and_download_already_imported()
        {
            const string downloadId = "51BB4A283478B29E3281C22C251A0A21D53E4D6A";

            _trackedDownload.DownloadItem.DownloadId = downloadId;
            _trackedDownload.RemoteEpisode = null;
            _trackedDownload.State = TrackedDownloadState.ImportPending;

            var episode = new Episode { Id = 1, EpisodeFileId = 10, SeriesId = 5 };
            var history = new List<EpisodeHistory>
            {
                new EpisodeHistory { EpisodeId = 1, EventType = EpisodeHistoryEventType.DownloadFolderImported, Date = System.DateTime.UtcNow, SeriesId = 5, DownloadId = downloadId },
                new EpisodeHistory { EpisodeId = 1, EventType = EpisodeHistoryEventType.Grabbed, Date = System.DateTime.UtcNow.AddMinutes(-5), SeriesId = 5, DownloadId = downloadId }
            };

            Mocker.GetMock<ISiteRipDownloadRepository>()
                  .Setup(r => r.FindByDownloadId(downloadId))
                  .Returns((SiteRipDownload)null);

            Mocker.GetMock<IHistoryService>()
                  .Setup(s => s.FindByDownloadId(downloadId))
                  .Returns(history);

            Mocker.GetMock<IEpisodeService>()
                  .Setup(s => s.GetEpisodes(It.IsAny<IEnumerable<int>>()))
                  .Returns(new List<Episode> { episode });

            Mocker.GetMock<IMediaFileService>()
                  .Setup(s => s.GetFiles(It.IsAny<IEnumerable<int>>()))
                  .Returns(new List<EpisodeFile>());

            Mocker.GetMock<ITrackedDownloadAlreadyImported>()
                  .Setup(s => s.IsImported(It.IsAny<TrackedDownload>(), It.IsAny<List<EpisodeHistory>>()))
                  .Returns(true);

            Mocker.GetMock<IDownloadHistoryService>()
                  .Setup(s => s.DownloadAlreadyImported(downloadId))
                  .Returns(true);

            Subject.Import(_trackedDownload);

            Mocker.GetMock<IEventAggregator>()
                  .Verify(v => v.PublishEvent(It.IsAny<DownloadCompletedEvent>()), Times.Never());

            _trackedDownload.State.Should().Be(TrackedDownloadState.Imported);
        }

        private void AssertNotImported()
        {
            Mocker.GetMock<IEventAggregator>()
                  .Verify(v => v.PublishEvent(It.IsAny<DownloadCompletedEvent>()), Times.Never());

            _trackedDownload.State.Should().Be(TrackedDownloadState.ImportPending);
        }

        private void AssertImported()
        {
            Mocker.GetMock<IDownloadedEpisodesImportService>()
                .Verify(v => v.ProcessPath(_trackedDownload.DownloadItem.OutputPath.FullPath, ImportMode.Auto, _trackedDownload.RemoteEpisode.Series, _trackedDownload.DownloadItem, null), Times.Once());

            Mocker.GetMock<IEventAggregator>()
                  .Verify(v => v.PublishEvent(It.IsAny<DownloadCompletedEvent>()), Times.Once());

            _trackedDownload.State.Should().Be(TrackedDownloadState.Imported);
        }
    }
}
