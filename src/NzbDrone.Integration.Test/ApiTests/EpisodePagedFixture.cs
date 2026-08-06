using System.Linq;
using System.Threading;
using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Test.Common;
using Whisparr.Api.V3.Series;

namespace NzbDrone.Integration.Test.ApiTests
{
    [TestFixture]
    public class EpisodePagedFixture : IntegrationTest
    {
        private SeriesResource _series;

        [SetUp]
        public void Setup()
        {
            _series = GivenSeriesWithEpisodes();
        }

        private SeriesResource GivenSeriesWithEpisodes()
        {
            var newSeries = Series.Lookup("My Family Pies").Single(c => c.TvdbId == 77);

            newSeries.QualityProfileId = 1;
            newSeries.Path = @"C:\Test\BrattySis".AsOsAgnostic();

            newSeries = Series.Post(newSeries);

            WaitForCompletion(() => Episodes.GetEpisodesInSeries(newSeries.Id).Count > 0);

            return newSeries;
        }

        [Test]
        public void should_return_paged_episodes_for_series()
        {
            var paged = Episodes.GetEpisodesPaged(_series.Id, pageSize: 5);

            paged.TotalRecords.Should().BeGreaterThan(0);
            paged.Records.Should().NotBeEmpty();
            paged.PageSize.Should().Be(5);
        }

        [Test]
        public void should_return_filter_bounds_for_series()
        {
            var bounds = Episodes.GetFilterBounds(_series.Id);

            bounds.MaxEpisodeRuntime.Should().BeGreaterOrEqualTo(0);
            (bounds.MaxEpisodeRuntime % 10).Should().Be(0);
        }

        [TearDown]
        public void TearDown()
        {
            Series.Delete(_series.Id);
            Thread.Sleep(2000);
        }
    }
}
