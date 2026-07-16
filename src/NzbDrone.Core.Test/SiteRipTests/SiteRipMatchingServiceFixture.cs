using System.Collections.Generic;
using System.Linq;
using FizzWare.NBuilder;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.SiteRip;
using NzbDrone.Core.Test.Framework;
using NzbDrone.Core.Tv;

namespace NzbDrone.Core.Test.SiteRipTests
{
    [TestFixture]
    public class SiteRipMatchingServiceFixture : CoreTest<SiteRipMatchingService>
    {
        private List<Episode> _episodes;

        [SetUp]
        public void SetUp()
        {
            _episodes = Builder<Episode>.CreateListOfSize(3)
                .TheFirst(1)
                .With(e => e.Id = 1)
                .With(e => e.Title = "My Scene Title")
                .With(e => e.Monitored = true)
                .With(e => e.Actors = new List<Actor>())
                .TheNext(1)
                .With(e => e.Id = 2)
                .With(e => e.Title = "Another Scene")
                .With(e => e.Monitored = false)
                .With(e => e.Actors = new List<Actor>())
                .TheNext(1)
                .With(e => e.Id = 3)
                .With(e => e.Title = "Third Scene")
                .With(e => e.Monitored = true)
                .With(e => e.Actors = new List<Actor>())
                .Build()
                .ToList();

            Mocker.GetMock<IEpisodeService>()
                  .Setup(s => s.GetEpisodeBySeries(It.IsAny<int>()))
                  .Returns(_episodes);

            Mocker.GetMock<IEpisodeService>()
                  .Setup(s => s.MatchEpisodeByImportFileName(It.IsAny<IEnumerable<Episode>>(), It.IsAny<string>(), It.IsAny<string>()))
                  .Returns((IEnumerable<Episode> episodes, string path, string downloadClientTitle) =>
                  {
                      if (path.Contains("My Scene Title") || path.Contains("My.Scene.Title"))
                      {
                          return _episodes.First(e => e.Id == 1);
                      }

                      return null;
                  });
        }

        [Test]
        public void should_auto_match_episode_from_filename()
        {
            var files = new List<TorrentFileMetadata>
            {
                new TorrentFileMetadata
                {
                    Index = 0,
                    Path = "site/My.Scene.Title.1080p.mp4",
                    Name = "My.Scene.Title.1080p.mp4",
                    Size = 1000
                }
            };

            var results = Subject.MatchFiles(1, files);

            results.Should().HaveCount(1);
            results[0].MatchedEpisodeId.Should().Be(1);
            results[0].MatchConfidence.Should().Be("auto");
            results[0].SelectedByDefault.Should().BeTrue();
        }

        [Test]
        public void should_group_multipart_files()
        {
            var files = new List<TorrentFileMetadata>
            {
                new TorrentFileMetadata
                {
                    Index = 0,
                    Path = "site/[01/02] - My Scene Title.mp4",
                    Name = "[01/02] - My Scene Title.mp4",
                    Size = 1000
                },
                new TorrentFileMetadata
                {
                    Index = 1,
                    Path = "site/[02/02] - My Scene Title.mp4",
                    Name = "[02/02] - My Scene Title.mp4",
                    Size = 2000
                }
            };

            var results = Subject.MatchFiles(1, files);

            results.Should().HaveCount(1);
            results[0].FileIndices.Should().BeEquivalentTo(new[] { 0, 1 });
            results[0].TotalSize.Should().Be(3000);
            results[0].PartNumber.Should().Be(1);
        }

        [Test]
        public void should_not_select_by_default_when_episode_has_file()
        {
            _episodes.First(e => e.Id == 1).EpisodeFileId = 1;

            var files = new List<TorrentFileMetadata>
            {
                new TorrentFileMetadata
                {
                    Index = 0,
                    Path = "site/My.Scene.Title.1080p.mp4",
                    Name = "My.Scene.Title.1080p.mp4",
                    Size = 1000
                }
            };

            var results = Subject.MatchFiles(1, files);

            results.Should().HaveCount(1);
            results[0].MatchedEpisodeId.Should().Be(1);
            results[0].SelectedByDefault.Should().BeFalse();
        }

        [Test]
        public void should_not_select_by_default_when_episode_unmonitored()
        {
            _episodes.First(e => e.Id == 1).Monitored = false;

            var files = new List<TorrentFileMetadata>
            {
                new TorrentFileMetadata
                {
                    Index = 0,
                    Path = "site/My.Scene.Title.1080p.mp4",
                    Name = "My.Scene.Title.1080p.mp4",
                    Size = 1000
                }
            };

            var results = Subject.MatchFiles(1, files);

            results.Should().HaveCount(1);
            results[0].SelectedByDefault.Should().BeFalse();
        }

        [Test]
        public void should_return_none_confidence_when_unmatched()
        {
            var files = new List<TorrentFileMetadata>
            {
                new TorrentFileMetadata
                {
                    Index = 0,
                    Path = "site/Unknown.File.mp4",
                    Name = "Unknown.File.mp4",
                    Size = 1000
                }
            };

            var results = Subject.MatchFiles(1, files);

            results.Should().HaveCount(1);
            results[0].MatchedEpisodeId.Should().BeNull();
            results[0].MatchConfidence.Should().Be("none");
            results[0].SelectedByDefault.Should().BeFalse();
        }

        [Test]
        public void should_report_progress_when_match_id_provided()
        {
            const string matchId = "match-1";
            var files = new List<TorrentFileMetadata>
            {
                new TorrentFileMetadata
                {
                    Index = 0,
                    Path = "site/My.Scene.Title.1080p.mp4",
                    Name = "My.Scene.Title.1080p.mp4",
                    Size = 1000
                },
                new TorrentFileMetadata
                {
                    Index = 1,
                    Path = "site/Unknown.File.mp4",
                    Name = "Unknown.File.mp4",
                    Size = 2000
                }
            };

            var results = Subject.MatchFiles(1, files, matchId);

            results.Should().HaveCount(2);

            Mocker.GetMock<ISiteRipMatchProgressService>()
                  .Verify(s => s.ReportMatching(matchId, 0, 2), Times.Once);

            Mocker.GetMock<ISiteRipMatchProgressService>()
                  .Verify(s => s.ReportMatching(matchId, 1, 2), Times.Once);

            Mocker.GetMock<ISiteRipMatchProgressService>()
                  .Verify(s => s.ReportMatching(matchId, 2, 2), Times.Once);
        }

        [Test]
        public void should_preserve_path_order_when_matching_many_files_in_parallel()
        {
            var files = new List<TorrentFileMetadata>();

            for (var i = 0; i < 20; i++)
            {
                files.Add(new TorrentFileMetadata
                {
                    Index = i,
                    Path = $"site/file-{i:D2}.mp4",
                    Name = $"file-{i:D2}.mp4",
                    Size = 1000 + i
                });
            }

            files.Add(new TorrentFileMetadata
            {
                Index = 20,
                Path = "site/[01/02] - My Scene Title.mp4",
                Name = "[01/02] - My Scene Title.mp4",
                Size = 5000
            });

            files.Add(new TorrentFileMetadata
            {
                Index = 21,
                Path = "site/[02/02] - My Scene Title.mp4",
                Name = "[02/02] - My Scene Title.mp4",
                Size = 6000
            });

            var results = Subject.MatchFiles(1, files);

            results.Should().HaveCount(21);
            results.Last().FileIndices.Should().BeEquivalentTo(new[] { 20, 21 });
            results.Last().MatchedEpisodeId.Should().Be(1);
            results.Last().TotalSize.Should().Be(11000);
        }
    }
}
