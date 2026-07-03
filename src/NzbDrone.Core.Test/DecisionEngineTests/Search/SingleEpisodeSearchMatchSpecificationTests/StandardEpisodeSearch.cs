using System;
using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.DecisionEngine.Specifications.Search;
using NzbDrone.Core.IndexerSearch.Definitions;
using NzbDrone.Core.Parser.Model;
using NzbDrone.Core.Tv;
using NzbDrone.Test.Common;

namespace NzbDrone.Core.Test.DecisionEngineTests.Search.SingleEpisodeSearchMatchSpecificationTests
{
    [TestFixture]
    public class StandardEpisodeSearch : TestBase<SingleEpisodeSearchMatchSpecification>
    {
        private RemoteEpisode _remoteEpisode = new RemoteEpisode();
        private SingleEpisodeSearchCriteria _searchCriteria = new SingleEpisodeSearchCriteria();

        [SetUp]
        public void Setup()
        {
            _remoteEpisode.ParsedEpisodeInfo = new ParsedEpisodeInfo();
            _remoteEpisode.ParsedEpisodeInfo.AirDate = "2023-01-18";
            _searchCriteria.ReleaseDate = new DateOnly(2023, 1, 18);
        }

        [Test]
        public void should_return_false_if_episode_number_does_not_match_search_criteria()
        {
            _remoteEpisode.ParsedEpisodeInfo.AirDate = "2023-02-18";

            Subject.IsSatisfiedBy(_remoteEpisode, _searchCriteria).Accepted.Should().BeFalse();
        }

        [Test]
        public void should_accept_mismatched_date_when_ignore_scene_date_enabled()
        {
            _searchCriteria.IgnoreSceneDate = true;
            _searchCriteria.Episodes = new System.Collections.Generic.List<Episode>
            {
                new Episode { Id = 1, Title = "Test Scene" }
            };
            _remoteEpisode.ParsedEpisodeInfo.AirDate = "2023-02-18";
            _remoteEpisode.Episodes = _searchCriteria.Episodes;

            Subject.IsSatisfiedBy(_remoteEpisode, _searchCriteria).Accepted.Should().BeTrue();
        }

        [Test]
        public void should_reject_when_ignore_scene_date_enabled_and_episode_not_matched()
        {
            _searchCriteria.IgnoreSceneDate = true;
            _searchCriteria.Episodes = new System.Collections.Generic.List<Episode>
            {
                new Episode { Id = 1, Title = "Test Scene" }
            };
            _remoteEpisode.ParsedEpisodeInfo.AirDate = "2023-02-18";
            _remoteEpisode.Episodes = new System.Collections.Generic.List<Episode>
            {
                new Episode { Id = 2, Title = "Other Scene" }
            };

            Subject.IsSatisfiedBy(_remoteEpisode, _searchCriteria).Accepted.Should().BeFalse();
        }
    }
}
