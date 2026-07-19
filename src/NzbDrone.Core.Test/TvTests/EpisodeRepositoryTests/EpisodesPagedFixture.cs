using System.Linq;
using FizzWare.NBuilder;
using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.Languages;
using NzbDrone.Core.MediaFiles;
using NzbDrone.Core.Qualities;
using NzbDrone.Core.Test.Framework;
using NzbDrone.Core.Tv;

namespace NzbDrone.Core.Test.TvTests.EpisodeRepositoryTests
{
    [TestFixture]
    public class EpisodesPagedFixture : DbTest<EpisodeRepository, Episode>
    {
        private const int SERIES_ID = 10;
        private Series _series;

        [SetUp]
        public void Setup()
        {
            _series = Builder<Series>.CreateNew()
                .With(s => s.Id = 0)
                .With(s => s.TitleSlug = "paged-series")
                .Build();

            _series.Id = Db.Insert(_series).Id;

            var episodeFile480 = Builder<EpisodeFile>.CreateNew()
                .With(f => f.Quality = new QualityModel(new Quality(1, "SDTV", QualitySource.Television, 480)))
                .With(f => f.Languages = new System.Collections.Generic.List<Language> { Language.English })
                .BuildNew();

            var episodeFile720 = Builder<EpisodeFile>.CreateNew()
                .With(f => f.Quality = new QualityModel(new Quality(4, "HDTV-720p", QualitySource.Television, 720)))
                .With(f => f.Languages = new System.Collections.Generic.List<Language> { Language.English })
                .BuildNew();

            Db.Insert(episodeFile480);
            Db.Insert(episodeFile720);

            var episodes = Builder<Episode>.CreateListOfSize(4)
                .All()
                .With(e => e.Id = 0)
                .With(e => e.SeriesId = _series.Id)
                .With(e => e.Monitored = true)
                .With(e => e.Runtime = 30)
                .TheFirst(1)
                .With(e => e.EpisodeFileId = 0)
                .With(e => e.Runtime = 0)
                .TheNext(1)
                .With(e => e.EpisodeFileId = episodeFile480.Id)
                .With(e => e.Runtime = 45)
                .TheNext(1)
                .With(e => e.EpisodeFileId = episodeFile720.Id)
                .With(e => e.Runtime = 90)
                .TheLast(1)
                .With(e => e.EpisodeFileId = 0)
                .With(e => e.Monitored = false)
                .With(e => e.Runtime = 60)
                .BuildListOfNew();

            Db.InsertMany(episodes);
        }

        [Test]
        public void should_page_episodes_for_series()
        {
            var pagingSpec = new PagingSpec<Episode>
            {
                Page = 1,
                PageSize = 2,
                SortKey = "AirDateUtc",
                SortDirection = SortDirection.Ascending
            };

            var result = Subject.GetEpisodesPaged(pagingSpec, _series.Id, new EpisodePagedFilter());

            result.TotalRecords.Should().Be(4);
            result.Records.Should().HaveCount(2);
        }

        [Test]
        public void should_filter_by_runtime_range()
        {
            var pagingSpec = new PagingSpec<Episode>
            {
                Page = 1,
                PageSize = 10,
                SortKey = "Runtime",
                SortDirection = SortDirection.Ascending
            };

            var filter = new EpisodePagedFilter
            {
                RuntimeMinMinutes = 40,
                RuntimeMaxMinutes = 70
            };

            var result = Subject.GetEpisodesPaged(pagingSpec, _series.Id, filter);

            result.TotalRecords.Should().Be(1);
            result.Records.Single().Runtime.Should().Be(60);
        }

        [Test]
        public void should_filter_by_runtime_min_and_max_inclusive()
        {
            var series = Builder<Series>.CreateNew()
                .With(s => s.Id = 0)
                .With(s => s.TitleSlug = "runtime-filter-series")
                .Build();

            series.Id = Db.Insert(series).Id;

            var episodes = Builder<Episode>.CreateListOfSize(3)
                .All()
                .With(e => e.Id = 0)
                .With(e => e.SeriesId = series.Id)
                .With(e => e.Monitored = true)
                .With(e => e.EpisodeFileId = 0)
                .TheFirst(1)
                .With(e => e.Runtime = 7)
                .TheNext(1)
                .With(e => e.Runtime = 10)
                .TheLast(1)
                .With(e => e.Runtime = 22)
                .BuildListOfNew();

            Db.InsertMany(episodes);

            var pagingSpec = new PagingSpec<Episode>
            {
                Page = 1,
                PageSize = 10,
                SortKey = "Runtime",
                SortDirection = SortDirection.Ascending
            };

            var filter = new EpisodePagedFilter
            {
                RuntimeMinMinutes = 10,
                RuntimeMaxMinutes = 100
            };

            var result = Subject.GetEpisodesPaged(pagingSpec, series.Id, filter);

            result.TotalRecords.Should().Be(2);
            result.Records.Select(e => e.Runtime).Should().BeEquivalentTo(new[] { 10, 22 });
        }

        [Test]
        public void should_filter_by_monitor_status()
        {
            var pagingSpec = new PagingSpec<Episode>
            {
                Page = 1,
                PageSize = 10,
                SortKey = "AirDateUtc",
                SortDirection = SortDirection.Ascending
            };

            var filter = new EpisodePagedFilter
            {
                MonitorStatus = "unmonitored"
            };

            var result = Subject.GetEpisodesPaged(pagingSpec, _series.Id, filter);

            result.TotalRecords.Should().Be(1);
            result.Records.Single().Monitored.Should().BeFalse();
        }

        [Test]
        public void should_return_rounded_max_runtime()
        {
            Subject.GetMaxEpisodeRuntime(_series.Id).Should().Be(90);
        }
    }
}
