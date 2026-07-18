using System.Collections.Generic;
using System.Linq;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.Test.Framework;
using NzbDrone.Core.Tv;

namespace NzbDrone.Core.Test.TvTests.EpisodeServiceTests
{
    [TestFixture]
    public class FindEpisodesFixture : CoreTest<EpisodeService>
    {
        [Test]
        public void should_return_only_existing_episodes()
        {
            Mocker.GetMock<IEpisodeRepository>()
                  .Setup(r => r.FindByIds(It.IsAny<IEnumerable<int>>()))
                  .Returns(new List<Episode>
                  {
                      new Episode { Id = 100 },
                      new Episode { Id = 101 }
                  });

            var episodes = Subject.FindEpisodes(new[] { 100, 101, 999 });

            episodes.Should().HaveCount(2);
            episodes.Select(e => e.Id).Should().BeEquivalentTo(new[] { 100, 101 });
        }

        [Test]
        public void should_return_empty_list_when_no_ids_provided()
        {
            var episodes = Subject.FindEpisodes(new List<int>());

            episodes.Should().BeEmpty();
            Mocker.GetMock<IEpisodeRepository>()
                  .Verify(r => r.FindByIds(It.IsAny<IEnumerable<int>>()), Times.Never());
        }
    }
}
