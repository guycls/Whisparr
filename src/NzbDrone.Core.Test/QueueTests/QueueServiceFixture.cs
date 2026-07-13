using System;
using System.Collections.Generic;
using System.Linq;
using FizzWare.NBuilder;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.Download;
using NzbDrone.Core.Download.TrackedDownloads;
using NzbDrone.Core.Parser.Model;
using NzbDrone.Core.Queue;
using NzbDrone.Core.SiteRip;
using NzbDrone.Core.Test.Framework;
using NzbDrone.Core.Tv;

namespace NzbDrone.Core.Test.QueueTests
{
    [TestFixture]
    public class QueueServiceFixture : CoreTest<QueueService>
    {
        private List<TrackedDownload> _trackedDownloads;

        [SetUp]
        public void SetUp()
        {
            var downloadClientInfo = Builder<DownloadClientItemClientInfo>.CreateNew().Build();

            var downloadItem = Builder<NzbDrone.Core.Download.DownloadClientItem>.CreateNew()
                                        .With(v => v.RemainingTime = TimeSpan.FromSeconds(10))
                                        .With(v => v.DownloadClientInfo = downloadClientInfo)
                                        .Build();

            var series = Builder<Series>.CreateNew()
                                        .Build();

            var episodes = Builder<Episode>.CreateListOfSize(3)
                                          .All()
                                          .With(e => e.SeriesId = series.Id)
                                          .Build();

            var remoteEpisode = Builder<RemoteEpisode>.CreateNew()
                                                   .With(r => r.Series = series)
                                                   .With(r => r.Episodes = new List<Episode>(episodes))
                                                   .With(r => r.ParsedEpisodeInfo = new ParsedEpisodeInfo())
                                                   .Build();

            _trackedDownloads = Builder<TrackedDownload>.CreateListOfSize(1)
                .All()
                .With(v => v.IsTrackable = true)
                .With(v => v.DownloadItem = downloadItem)
                .With(v => v.RemoteEpisode = remoteEpisode)
                .Build()
                .ToList();
        }

        [Test]
        public void queue_items_should_have_id()
        {
            Subject.Handle(new TrackedDownloadRefreshedEvent(_trackedDownloads));

            var queue = Subject.GetQueue();

            queue.Should().HaveCount(3);

            queue.All(v => v.Id > 0).Should().BeTrue();

            var distinct = queue.Select(v => v.Id).Distinct().ToArray();

            distinct.Should().HaveCount(3);
        }

        [Test]
        public void should_expand_siterip_queue_from_unimported_db_files_instead_of_remote_episode()
        {
            const string downloadId = "SITERIPPACK";
            const int siteRipDownloadId = 42;

            var downloadClientInfo = Builder<DownloadClientItemClientInfo>.CreateNew().Build();

            var downloadItem = Builder<DownloadClientItem>.CreateNew()
                .With(v => v.DownloadId = downloadId)
                .With(v => v.RemainingTime = TimeSpan.FromSeconds(10))
                .With(v => v.DownloadClientInfo = downloadClientInfo)
                .Build();

            var series = Builder<Series>.CreateNew()
                .With(s => s.Id = 12)
                .Build();

            var remoteEpisodes = Builder<Episode>.CreateListOfSize(2)
                .TheFirst(1)
                .With(e => e.Id = 100)
                .With(e => e.SeriesId = series.Id)
                .TheNext(1)
                .With(e => e.Id = 101)
                .With(e => e.SeriesId = series.Id)
                .Build();

            var dbEpisodes = Builder<Episode>.CreateListOfSize(5)
                .TheFirst(1)
                .With(e => e.Id = 100)
                .With(e => e.SeriesId = series.Id)
                .TheNext(1)
                .With(e => e.Id = 101)
                .With(e => e.SeriesId = series.Id)
                .TheNext(1)
                .With(e => e.Id = 102)
                .With(e => e.SeriesId = series.Id)
                .TheNext(1)
                .With(e => e.Id = 103)
                .With(e => e.SeriesId = series.Id)
                .TheNext(1)
                .With(e => e.Id = 104)
                .With(e => e.SeriesId = series.Id)
                .Build();

            var remoteEpisode = Builder<RemoteEpisode>.CreateNew()
                .With(r => r.Series = series)
                .With(r => r.Episodes = new List<Episode>(remoteEpisodes))
                .With(r => r.ParsedEpisodeInfo = new ParsedEpisodeInfo())
                .Build();

            var trackedDownloads = Builder<TrackedDownload>.CreateListOfSize(1)
                .All()
                .With(v => v.IsTrackable = true)
                .With(v => v.DownloadItem = downloadItem)
                .With(v => v.RemoteEpisode = remoteEpisode)
                .Build()
                .ToList();

            Mocker.GetMock<ISiteRipDownloadRepository>()
                  .Setup(r => r.FindByDownloadId(downloadId))
                  .Returns(new SiteRipDownload
                  {
                      Id = siteRipDownloadId,
                      DownloadId = downloadId,
                      SeriesId = series.Id
                  });

            Mocker.GetMock<ISiteRipPendingFileService>()
                  .Setup(s => s.GetPendingFiles(siteRipDownloadId))
                  .Returns(new List<SiteRipDownloadFile>
                  {
                      new SiteRipDownloadFile { EpisodeId = 100, FileIndex = 1, Imported = false },
                      new SiteRipDownloadFile { EpisodeId = 101, FileIndex = 2, Imported = false },
                      new SiteRipDownloadFile { EpisodeId = 102, FileIndex = 3, Imported = false },
                      new SiteRipDownloadFile { EpisodeId = 103, FileIndex = 4, Imported = false },
                      new SiteRipDownloadFile { EpisodeId = 104, FileIndex = 5, Imported = false }
                  });

            Mocker.GetMock<IEpisodeService>()
                  .Setup(s => s.GetEpisodes(It.IsAny<IEnumerable<int>>()))
                  .Returns(dbEpisodes.ToList());

            Mocker.GetMock<ISeriesService>()
                  .Setup(s => s.GetSeries(series.Id))
                  .Returns(series);

            Subject.Handle(new TrackedDownloadRefreshedEvent(trackedDownloads));

            var queue = Subject.GetQueue();

            queue.Should().HaveCount(5);
            queue.Select(q => q.Episode.Id).Should().BeEquivalentTo(new[] { 100, 101, 102, 103, 104 });
            queue.Should().OnlyContain(q => q.Series.Id == series.Id);
        }

        [Test]
        public void should_expand_siterip_queue_from_episodes_without_library_files_even_when_db_imported()
        {
            const string downloadId = "SITERIPSTALE";
            const int siteRipDownloadId = 42;

            var downloadClientInfo = Builder<DownloadClientItemClientInfo>.CreateNew().Build();

            var downloadItem = Builder<DownloadClientItem>.CreateNew()
                .With(v => v.DownloadId = downloadId)
                .With(v => v.RemainingTime = TimeSpan.FromSeconds(10))
                .With(v => v.DownloadClientInfo = downloadClientInfo)
                .Build();

            var series = Builder<Series>.CreateNew()
                .With(s => s.Id = 12)
                .Build();

            var dbEpisodes = Builder<Episode>.CreateListOfSize(2)
                .TheFirst(1)
                .With(e => e.Id = 100)
                .With(e => e.SeriesId = series.Id)
                .With(e => e.EpisodeFileId = 0)
                .TheNext(1)
                .With(e => e.Id = 101)
                .With(e => e.SeriesId = series.Id)
                .With(e => e.EpisodeFileId = 0)
                .Build();

            var remoteEpisode = Builder<RemoteEpisode>.CreateNew()
                .With(r => r.Series = series)
                .With(r => r.Episodes = new List<Episode>())
                .With(r => r.ParsedEpisodeInfo = new ParsedEpisodeInfo())
                .Build();

            var trackedDownloads = Builder<TrackedDownload>.CreateListOfSize(1)
                .All()
                .With(v => v.IsTrackable = true)
                .With(v => v.DownloadItem = downloadItem)
                .With(v => v.RemoteEpisode = remoteEpisode)
                .Build()
                .ToList();

            Mocker.GetMock<ISiteRipDownloadRepository>()
                  .Setup(r => r.FindByDownloadId(downloadId))
                  .Returns(new SiteRipDownload
                  {
                      Id = siteRipDownloadId,
                      DownloadId = downloadId,
                      SeriesId = series.Id
                  });

            Mocker.GetMock<ISiteRipPendingFileService>()
                  .Setup(s => s.GetPendingFiles(siteRipDownloadId))
                  .Returns(new List<SiteRipDownloadFile>
                  {
                      new SiteRipDownloadFile { EpisodeId = 100, FileIndex = 1, Imported = true },
                      new SiteRipDownloadFile { EpisodeId = 101, FileIndex = 2, Imported = true }
                  });

            Mocker.GetMock<IEpisodeService>()
                  .Setup(s => s.GetEpisodes(It.IsAny<IEnumerable<int>>()))
                  .Returns(dbEpisodes.ToList());

            Mocker.GetMock<ISeriesService>()
                  .Setup(s => s.GetSeries(series.Id))
                  .Returns(series);

            Subject.Handle(new TrackedDownloadRefreshedEvent(trackedDownloads));

            var queue = Subject.GetQueue();

            queue.Should().HaveCount(2);
            queue.Select(q => q.Episode.Id).Should().BeEquivalentTo(new[] { 100, 101 });
        }
    }
}
