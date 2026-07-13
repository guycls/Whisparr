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
                  .Setup(s => s.GetEpisodes(It.IsAny<IEnumerable<int>>()))
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
                  .Setup(s => s.GetEpisodes(It.IsAny<IEnumerable<int>>()))
                  .Returns(new List<Episode>
                  {
                      new Episode { Id = 100, EpisodeFileId = 0 },
                      new Episode { Id = 101, EpisodeFileId = 42 }
                  });

            var pending = Subject.GetPendingFiles(SiteRipDownloadId);

            pending.Should().ContainSingle();
            pending[0].EpisodeId.Should().Be(100);
        }
    }
}
