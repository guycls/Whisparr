using System.Collections.Generic;
using System.Linq;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.SiteRip;
using NzbDrone.Core.Test.Framework;
using NzbDrone.Core.Tv;

namespace NzbDrone.Core.Test.SiteRipTests
{
    [TestFixture]
    public class SiteRipPendingFileServiceFixture : CoreTest<SiteRipPendingFileService>
    {
        private const int SiteRipDownloadId = 5;

        [Test]
        public void should_include_files_when_episode_has_no_library_file()
        {
            Mocker.GetMock<ISiteRipDownloadFileRepository>()
                  .Setup(r => r.GetByDownloadId(SiteRipDownloadId))
                  .Returns(new List<SiteRipDownloadFile>
                  {
                      new SiteRipDownloadFile { EpisodeId = 100, FileIndex = 1, Imported = false },
                      new SiteRipDownloadFile { EpisodeId = 101, FileIndex = 2, Imported = true }
                  });

            Mocker.GetMock<IEpisodeService>()
                  .Setup(s => s.FindEpisodes(It.IsAny<IEnumerable<int>>()))
                  .Returns(new List<Episode>
                  {
                      new Episode { Id = 100, EpisodeFileId = 0 },
                      new Episode { Id = 101, EpisodeFileId = 0 }
                  });

            var pending = Subject.GetPendingFiles(SiteRipDownloadId);

            pending.Should().HaveCount(2);
            pending.Select(f => f.EpisodeId).Should().BeEquivalentTo(new[] { 100, 101 });
        }

        [Test]
        public void should_exclude_files_when_episode_has_library_file()
        {
            Mocker.GetMock<ISiteRipDownloadFileRepository>()
                  .Setup(r => r.GetByDownloadId(SiteRipDownloadId))
                  .Returns(new List<SiteRipDownloadFile>
                  {
                      new SiteRipDownloadFile { EpisodeId = 100, FileIndex = 1, Imported = false },
                      new SiteRipDownloadFile { EpisodeId = 101, FileIndex = 2, Imported = true }
                  });

            Mocker.GetMock<IEpisodeService>()
                  .Setup(s => s.FindEpisodes(It.IsAny<IEnumerable<int>>()))
                  .Returns(new List<Episode>
                  {
                      new Episode { Id = 100, EpisodeFileId = 0 },
                      new Episode { Id = 101, EpisodeFileId = 42 }
                  });

            var pending = Subject.GetPendingFiles(SiteRipDownloadId);

            pending.Should().ContainSingle();
            pending[0].EpisodeId.Should().Be(100);
        }

        [Test]
        public void should_exclude_files_when_episode_no_longer_exists()
        {
            Mocker.GetMock<ISiteRipDownloadFileRepository>()
                  .Setup(r => r.GetByDownloadId(SiteRipDownloadId))
                  .Returns(new List<SiteRipDownloadFile>
                  {
                      new SiteRipDownloadFile { EpisodeId = 100, FileIndex = 1, Imported = false },
                      new SiteRipDownloadFile { EpisodeId = 999, FileIndex = 2, Imported = false }
                  });

            Mocker.GetMock<IEpisodeService>()
                  .Setup(s => s.FindEpisodes(It.IsAny<IEnumerable<int>>()))
                  .Returns(new List<Episode>
                  {
                      new Episode { Id = 100, EpisodeFileId = 0 }
                  });

            var pending = Subject.GetPendingFiles(SiteRipDownloadId);

            pending.Should().ContainSingle();
            pending[0].EpisodeId.Should().Be(100);
        }

        [Test]
        public void should_delete_orphaned_site_rip_file_records()
        {
            Mocker.GetMock<ISiteRipDownloadFileRepository>()
                  .Setup(r => r.GetByDownloadId(SiteRipDownloadId))
                  .Returns(new List<SiteRipDownloadFile>
                  {
                      new SiteRipDownloadFile { EpisodeId = 100, FileIndex = 1, Imported = false },
                      new SiteRipDownloadFile { EpisodeId = 999, FileIndex = 2, Imported = false }
                  });

            Mocker.GetMock<IEpisodeService>()
                  .Setup(s => s.FindEpisodes(It.IsAny<IEnumerable<int>>()))
                  .Returns(new List<Episode>
                  {
                      new Episode { Id = 100, EpisodeFileId = 0 }
                  });

            Subject.GetPendingFiles(SiteRipDownloadId);

            Mocker.GetMock<ISiteRipDownloadFileRepository>()
                  .Verify(r => r.DeleteForEpisodes(SiteRipDownloadId, It.Is<IEnumerable<int>>(ids => ids.SequenceEqual(new[] { 999 }))), Times.Once());
        }

        [Test]
        public void should_not_throw_when_all_episodes_missing()
        {
            Mocker.GetMock<ISiteRipDownloadFileRepository>()
                  .Setup(r => r.GetByDownloadId(SiteRipDownloadId))
                  .Returns(new List<SiteRipDownloadFile>
                  {
                      new SiteRipDownloadFile { EpisodeId = 999, FileIndex = 1, Imported = false }
                  });

            Mocker.GetMock<IEpisodeService>()
                  .Setup(s => s.FindEpisodes(It.IsAny<IEnumerable<int>>()))
                  .Returns(new List<Episode>());

            var pending = Subject.GetPendingFiles(SiteRipDownloadId);

            pending.Should().BeEmpty();
            Subject.HasPendingFiles(SiteRipDownloadId).Should().BeFalse();
        }
    }
}
