using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.Test.Framework;
using NzbDrone.Core.Tv;

namespace NzbDrone.Core.Test.TvTests
{
    [TestFixture]
    public class EpisodeQualityFilterFixture : TestBase
    {
        [Test]
        public void should_treat_full_range_as_no_filter()
        {
            EpisodeQualityFilter.IsFullRange(0, 6).Should().BeTrue();
            EpisodeQualityFilter.BuildWhereClause(0, 6).Should().BeNull();
        }

        [Test]
        public void should_build_unknown_tier_clause()
        {
            var clause = EpisodeQualityFilter.BuildWhereClause(0, 0);

            clause.Should().Contain("\"Episodes\".\"EpisodeFileId\" = 0");
        }

        [Test]
        public void should_build_vr_tier_clause()
        {
            var clause = EpisodeQualityFilter.BuildWhereClause(6, 6);

            clause.Should().Contain("\"source\":\"vr\"");
        }

        [Test]
        public void should_build_720p_tier_clause()
        {
            var clause = EpisodeQualityFilter.BuildWhereClause(3, 3);

            clause.Should().Contain("\"resolution\":720");
        }
    }
}
