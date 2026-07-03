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
    public class MatchEpisodeByReleaseTokensFixture : CoreTest<EpisodeService>
    {
        [Test]
        public void should_match_period_delimited_release_title()
        {
            var episode = Builder<Episode>.CreateNew()
                                          .With(e => e.Title = "My Scene Title")
                                          .With(e => e.Actors = new List<Actor>())
                                          .Build();

            var result = Subject.MatchEpisodeByReleaseTokens(new List<Episode> { episode },
                "SiteName.Performer.My.Scene.Title.1080p.mp4");

            result.Should().NotBeNull();
            result.Title.Should().Be("My Scene Title");
        }

        [Test]
        public void should_return_null_when_multiple_episodes_match()
        {
            var episodes = Builder<Episode>.CreateListOfSize(2)
                                           .All()
                                           .With(e => e.Title = "My Scene Title")
                                           .With(e => e.Actors = new List<Actor>())
                                           .Build()
                                           .ToList();

            var result = Subject.MatchEpisodeByReleaseTokens(episodes, "SiteName.My.Scene.Title.1080p.mp4");

            result.Should().BeNull();
        }

        [Test]
        public void should_return_null_when_no_match()
        {
            var episode = Builder<Episode>.CreateNew()
                                          .With(e => e.Title = "Different Title")
                                          .With(e => e.Actors = new List<Actor>())
                                          .Build();

            var result = Subject.MatchEpisodeByReleaseTokens(new List<Episode> { episode },
                "SiteName.Something.Else.1080p.mp4");

            result.Should().BeNull();
        }
    }
}
