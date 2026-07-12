using System.Collections.Generic;
using System.Linq;
using FizzWare.NBuilder;
using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.Test.Framework;
using NzbDrone.Core.Tv;

namespace NzbDrone.Core.Test.TvTests.EpisodeServiceTests
{
    [TestFixture]
    public class MatchEpisodeByImportFileNameFixture : CoreTest<EpisodeService>
    {
        [Test]
        public void should_match_by_release_tokens_across_years()
        {
            var episodes = new List<Episode>
            {
                Builder<Episode>.CreateNew()
                                .With(e => e.Title = "Older Scene")
                                .With(e => e.SeasonNumber = 2020)
                                .With(e => e.Actors = new List<Actor>())
                                .Build(),
                Builder<Episode>.CreateNew()
                                .With(e => e.Title = "My Scene Title")
                                .With(e => e.SeasonNumber = 2022)
                                .With(e => e.Actors = new List<Actor>())
                                .Build()
            };

            var result = Subject.MatchEpisodeByImportFileName(episodes,
                @"C:\downloads\SiteName.My.Scene.Title.1080p.mp4");

            result.Should().NotBeNull();
            result.Title.Should().Be("My Scene Title");
            result.SeasonNumber.Should().Be(2022);
        }

        [Test]
        public void should_match_by_exact_normalized_filename()
        {
            var episodes = new List<Episode>
            {
                Builder<Episode>.CreateNew()
                                .With(e => e.Title = "Another Scene")
                                .With(e => e.SeasonNumber = 2021)
                                .With(e => e.Actors = new List<Actor>())
                                .Build(),
                Builder<Episode>.CreateNew()
                                .With(e => e.Title = "Exact Scene Title")
                                .With(e => e.SeasonNumber = 2023)
                                .With(e => e.Actors = new List<Actor>())
                                .Build()
            };

            var result = Subject.MatchEpisodeByImportFileName(episodes,
                @"C:\downloads\Exact.Scene.Title.mp4");

            result.Should().NotBeNull();
            result.Title.Should().Be("Exact Scene Title");
            result.SeasonNumber.Should().Be(2023);
        }

        [Test]
        public void should_return_null_when_multiple_exact_filename_matches()
        {
            var episodes = Builder<Episode>.CreateListOfSize(2)
                                           .All()
                                           .With(e => e.Title = "Shared Title")
                                           .With(e => e.Actors = new List<Actor>())
                                           .Build()
                                           .ToList();

            var result = Subject.MatchEpisodeByImportFileName(episodes,
                @"C:\downloads\Shared.Title.mp4");

            result.Should().BeNull();
        }

        [Test]
        public void should_match_by_longest_common_substring_when_unambiguous()
        {
            var episodes = new List<Episode>
            {
                Builder<Episode>.CreateNew()
                                .With(e => e.Title = "Short")
                                .With(e => e.SeasonNumber = 2020)
                                .With(e => e.Actors = new List<Actor>())
                                .Build(),
                Builder<Episode>.CreateNew()
                                .With(e => e.Title = "Unique Adventure Story")
                                .With(e => e.SeasonNumber = 2021)
                                .With(e => e.Actors = new List<Actor>())
                                .Build()
            };

            var result = Subject.MatchEpisodeByImportFileName(episodes,
                @"C:\downloads\imported.flnm.unique-adventure-extra.mp4");

            result.Should().NotBeNull();
            result.Title.Should().Be("Unique Adventure Story");
            result.SeasonNumber.Should().Be(2021);
        }

        [Test]
        public void should_return_null_when_substring_match_is_ambiguous()
        {
            var episodes = Builder<Episode>.CreateListOfSize(2)
                                           .All()
                                           .With(e => e.Title = "Unique Adventure Story")
                                           .With(e => e.Actors = new List<Actor>())
                                           .Build()
                                           .ToList();

            var result = Subject.MatchEpisodeByImportFileName(episodes,
                @"C:\downloads\imported.flnm.unique-adventure-extra.mp4");

            result.Should().BeNull();
        }

        [Test]
        public void should_return_null_when_substring_match_below_threshold()
        {
            var episode = Builder<Episode>.CreateNew()
                                          .With(e => e.Title = "Longer Title Here")
                                          .With(e => e.Actors = new List<Actor>())
                                          .Build();

            var result = Subject.MatchEpisodeByImportFileName(new List<Episode> { episode },
                @"C:\downloads\abcd.mp4");

            result.Should().BeNull();
        }

        [Test]
        public void should_return_null_when_no_candidates()
        {
            var result = Subject.MatchEpisodeByImportFileName(new List<Episode>(),
                @"C:\downloads\Some.File.mp4");

            result.Should().BeNull();
        }
    }
}
