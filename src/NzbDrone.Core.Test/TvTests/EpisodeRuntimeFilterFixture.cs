using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.Test.Framework;
using NzbDrone.Core.Tv;

namespace NzbDrone.Core.Test.TvTests
{
    [TestFixture]
    public class EpisodeRuntimeFilterFixture : TestBase
    {
        [TestCase(0, 0)]
        [TestCase(45, 50)]
        [TestCase(50, 50)]
        [TestCase(51, 60)]
        public void should_round_runtime_max_up_to_nearest_ten(int input, int expected)
        {
            EpisodeRuntimeFilter.RoundRuntimeMax(input).Should().Be(expected);
        }
    }
}
