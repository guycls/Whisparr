using FizzWare.NBuilder;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Common.Cache;
using NzbDrone.Core.IndexerSearch;
using NzbDrone.Core.IndexerSearch.Definitions;
using NzbDrone.Core.Localization;
using NzbDrone.Core.Test.Framework;
using NzbDrone.Core.Tv;

namespace NzbDrone.Core.Test.IndexerSearchTests
{
    [TestFixture]
    public class SearchProgressServiceFixture : CoreTest<SearchProgressService>
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
        public void should_report_starting_phase()
        {
            const string searchId = "search-1";

            Subject.Start(searchId);

            var progress = Subject.Get(searchId);

            progress.Should().NotBeNull();
            progress.Phase.Should().Be("starting");
            progress.Message.Should().Be("InteractiveSearchStatusStarting");
        }

        [Test]
        public void should_report_preparing_for_episode_search()
        {
            const string searchId = "search-2";
            var series = Builder<Series>.CreateNew()
                                        .With(s => s.Title = "Test Studio")
                                        .Build();

            var criteria = new SingleEpisodeSearchCriteria
            {
                Series = series,
                EpisodeTitle = "Test Scene"
            };

            Subject.ReportPreparing(searchId, criteria, 3);

            var progress = Subject.Get(searchId);

            progress.Phase.Should().Be("preparing");
            progress.IndexerCount.Should().Be(3);
            progress.Message.Should().Contain("InteractiveSearchStatusSearchingEpisode");
        }

        [Test]
        public void should_report_querying_indexer_progress()
        {
            const string searchId = "search-3";

            Subject.ReportQuerying(searchId, "Indexer A", 2, 5);

            var progress = Subject.Get(searchId);

            progress.Phase.Should().Be("querying");
            progress.CompletedIndexers.Should().Be(2);
            progress.IndexerCount.Should().Be(5);
            progress.Message.Should().Contain("InteractiveSearchStatusQueryingIndexer");
        }

        [Test]
        public void should_mark_complete()
        {
            const string searchId = "search-4";

            Subject.Start(searchId);
            Subject.Complete(searchId);

            var progress = Subject.Get(searchId);

            progress.IsComplete.Should().BeTrue();
            progress.Phase.Should().Be("completed");
        }

        [Test]
        public void should_clear_progress()
        {
            const string searchId = "search-5";

            Subject.Start(searchId);
            Subject.Clear(searchId);

            Subject.Get(searchId).Should().BeNull();
        }

        [Test]
        public void should_report_fail_with_error()
        {
            const string searchId = "search-6";

            Subject.Fail(searchId, "Search failed");

            var progress = Subject.Get(searchId);

            progress.IsComplete.Should().BeTrue();
            progress.Phase.Should().Be("failed");
            progress.Error.Should().Be("Search failed");
        }
    }
}
