using System.Collections.Generic;
using FizzWare.NBuilder;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.History;
using NzbDrone.Core.Parser.Model;
using NzbDrone.Core.SiteRip;
using NzbDrone.Core.Test.Framework;
using NzbDrone.Core.Tv;

namespace NzbDrone.Core.Test.SiteRipTests
{
    [TestFixture]
    public class SiteRipProgressServiceFixture : CoreTest<SiteRipProgressService>
    {
        [Test]
        public void should_append_siterip_suffix_to_queue_title()
        {
            var episode = Builder<Episode>.CreateNew()
                .With(e => e.Id = 10)
                .With(e => e.Title = "Scene Title")
                .Build();

            Mocker.GetMock<IHistoryService>()
                  .Setup(s => s.FindByDownloadId(It.IsAny<string>()))
                  .Returns(new List<EpisodeHistory>
                  {
                      new EpisodeHistory
                      {
                          EpisodeId = 10,
                          EventType = EpisodeHistoryEventType.Grabbed,
                          Data = new Dictionary<string, string> { { HistoryDataKeys.IsSiteRip, "true" } }
                      }
                  });

            var title = Subject.FormatQueueTitle(episode, "torrent-name", "download-id");

            title.Should().Be("Scene Title [SiteRIP]");
        }

        [Test]
        public void should_use_default_title_for_non_siterip()
        {
            var episode = Builder<Episode>.CreateNew()
                .With(e => e.Id = 10)
                .With(e => e.Title = "Scene Title")
                .Build();

            Mocker.GetMock<IHistoryService>()
                  .Setup(s => s.FindByDownloadId(It.IsAny<string>()))
                  .Returns(new List<EpisodeHistory>());

            Mocker.GetMock<ISiteRipDownloadRepository>()
                  .Setup(s => s.FindByDownloadId(It.IsAny<string>()))
                  .Returns((SiteRipDownload)null);

            var title = Subject.FormatQueueTitle(episode, "torrent-name", "download-id");

            title.Should().Be("torrent-name");
        }

        [Test]
        public void should_append_siterip_suffix_when_release_source_is_siterip()
        {
            var episode = Builder<Episode>.CreateNew()
                .With(e => e.Id = 10)
                .With(e => e.Title = "Scene Title")
                .Build();

            Mocker.GetMock<IHistoryService>()
                  .Setup(s => s.FindByDownloadId(It.IsAny<string>()))
                  .Returns(new List<EpisodeHistory>
                  {
                      new EpisodeHistory
                      {
                          EpisodeId = 10,
                          EventType = EpisodeHistoryEventType.Grabbed,
                          Data = new Dictionary<string, string> { { HistoryDataKeys.ReleaseSource, nameof(ReleaseSourceType.SiteRip) } }
                      }
                  });

            var title = Subject.FormatQueueTitle(episode, "torrent-name", "download-id");

            title.Should().Be("Scene Title [SiteRIP]");
        }

        [Test]
        public void should_append_siterip_suffix_when_download_id_case_differs()
        {
            var episode = Builder<Episode>.CreateNew()
                .With(e => e.Id = 10)
                .With(e => e.Title = "Scene Title")
                .Build();

            Mocker.GetMock<IHistoryService>()
                  .Setup(s => s.FindByDownloadId("ABCDEF"))
                  .Returns(new List<EpisodeHistory>());

            Mocker.GetMock<IHistoryService>()
                  .Setup(s => s.FindByDownloadId("abcdef"))
                  .Returns(new List<EpisodeHistory>
                  {
                      new EpisodeHistory
                      {
                          EpisodeId = 10,
                          EventType = EpisodeHistoryEventType.Grabbed,
                          Data = new Dictionary<string, string> { { HistoryDataKeys.IsSiteRip, "true" } }
                      }
                  });

            var title = Subject.FormatQueueTitle(episode, "torrent-name", "ABCDEF");

            title.Should().Be("Scene Title [SiteRIP]");
        }

        [Test]
        public void should_append_siterip_suffix_when_site_rip_download_record_case_differs()
        {
            var episode = Builder<Episode>.CreateNew()
                .With(e => e.Id = 10)
                .With(e => e.Title = "Scene Title")
                .Build();

            Mocker.GetMock<IHistoryService>()
                  .Setup(s => s.FindByDownloadId(It.IsAny<string>()))
                  .Returns(new List<EpisodeHistory>());

            Mocker.GetMock<ISiteRipDownloadRepository>()
                  .Setup(s => s.FindByDownloadId("ABCDEF"))
                  .Returns(new SiteRipDownload { DownloadId = "abcdef" });

            var title = Subject.FormatQueueTitle(episode, "torrent-name", "ABCDEF");

            title.Should().Be("Scene Title [SiteRIP]");
        }
    }
}
