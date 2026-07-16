using System.Collections.Generic;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Common.Cache;
using NzbDrone.Core.Localization;
using NzbDrone.Core.SiteRip;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.SiteRipTests
{
    [TestFixture]
    public class SiteRipMatchProgressServiceFixture : CoreTest<SiteRipMatchProgressService>
    {
        [SetUp]
        public void SetUp()
        {
            Mocker.SetConstant<ICacheManager>(Mocker.Resolve<CacheManager>());

            Mocker.GetMock<ILocalizationService>()
                  .Setup(s => s.GetLocalizedString(It.IsAny<string>()))
                  .Returns<string>(phrase => phrase);
        }

        [Test]
        public void should_report_matching_progress()
        {
            const string matchId = "match-1";

            Subject.ReportMatching(matchId, 3, 10);

            var progress = Subject.Get(matchId);

            progress.Should().NotBeNull();
            progress.Phase.Should().Be("matching");
            progress.CompletedFiles.Should().Be(3);
            progress.TotalFiles.Should().Be(10);
        }

        [Test]
        public void should_store_results_on_complete()
        {
            const string matchId = "match-2";
            var torrentFiles = new List<TorrentFileMetadata>
            {
                new TorrentFileMetadata { Index = 0, Path = "a.mp4", Name = "a.mp4", Size = 100 }
            };

            var matches = new List<SiteRipMatchResult>
            {
                new SiteRipMatchResult { DisplayName = "a.mp4" }
            };

            Subject.Complete(matchId, torrentFiles, matches);

            var progress = Subject.Get(matchId);

            progress.Should().NotBeNull();
            progress.IsComplete.Should().BeTrue();
            progress.Phase.Should().Be("completed");
            progress.TorrentFiles.Should().HaveCount(1);
            progress.Matches.Should().HaveCount(1);
        }
    }
}
