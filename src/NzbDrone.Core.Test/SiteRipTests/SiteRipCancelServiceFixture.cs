using System.Collections.Generic;
using System.Linq;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Common.Http;
using NzbDrone.Core.Download;
using NzbDrone.Core.Download.Clients;
using NzbDrone.Core.Download.Clients.QBittorrent;
using NzbDrone.Core.Download.TrackedDownloads;
using NzbDrone.Core.History;
using NzbDrone.Core.Messaging.Events;
using NzbDrone.Core.Parser.Model;
using NzbDrone.Core.SiteRip;
using NzbDrone.Core.Test.Framework;
using NzbDrone.Core.Tv;

namespace NzbDrone.Core.Test.SiteRipTests
{
    [TestFixture]
    public class SiteRipCancelServiceFixture : CoreTest<SiteRipCancelService>
    {
        private const string TorrentHash = "CBC2F069FE8BB2F544EAE707D75BCD3DE9DCF951";
        private const int SiteRipDownloadId = 5;

        private List<SiteRipDownloadFile> _files;
        private List<EpisodeHistory> _grabbedHistory;
        private List<int> _unwantedIndicesPassed;
        private List<int> _wantedIndicesPassed;
        private List<int> _deletedEpisodeIds;
        private List<IEnumerable<int>> _deleteGrabbedCalls;
        private bool _removeItemCalled;

        [SetUp]
        public void Setup()
        {
            _files = new List<SiteRipDownloadFile>
            {
                new SiteRipDownloadFile { Id = 1, SiteRipDownloadId = SiteRipDownloadId, EpisodeId = 42, FileIndex = 10, Imported = false },
                new SiteRipDownloadFile { Id = 2, SiteRipDownloadId = SiteRipDownloadId, EpisodeId = 43, FileIndex = 20, Imported = false }
            };
            _grabbedHistory = new List<EpisodeHistory>
            {
                new EpisodeHistory { EpisodeId = 42, SeriesId = 1, DownloadId = TorrentHash, EventType = EpisodeHistoryEventType.Grabbed, Data = new Dictionary<string, string>() },
                new EpisodeHistory { EpisodeId = 43, SeriesId = 1, DownloadId = TorrentHash, EventType = EpisodeHistoryEventType.Grabbed, Data = new Dictionary<string, string>() }
            };
            _unwantedIndicesPassed = null;
            _wantedIndicesPassed = null;
            _deletedEpisodeIds = new List<int>();
            _deleteGrabbedCalls = new List<IEnumerable<int>>();
            _removeItemCalled = false;

            GivenQBitClient();

            Mocker.GetMock<ISiteRipDownloadRepository>()
                  .Setup(r => r.FindByDownloadId(TorrentHash))
                  .Returns(new SiteRipDownload
                  {
                      Id = SiteRipDownloadId,
                      DownloadId = TorrentHash,
                      SeriesId = 1,
                      DownloadClientId = 1
                  });

            Mocker.GetMock<ISiteRipDownloadFileRepository>()
                  .Setup(r => r.GetUnimportedByDownloadId(SiteRipDownloadId))
                  .Returns(() => _files.Where(f => !f.Imported).ToList());

            Mocker.GetMock<ISiteRipDownloadFileRepository>()
                  .Setup(r => r.GetByDownloadId(SiteRipDownloadId))
                  .Returns(() => _files);

            Mocker.GetMock<ISiteRipDownloadFileRepository>()
                  .Setup(r => r.GetFileIndicesByEpisodes(SiteRipDownloadId, It.IsAny<IEnumerable<int>>()))
                  .Returns<int, IEnumerable<int>>((_, episodeIds) =>
                      _files.Where(f => episodeIds.Contains(f.EpisodeId)).Select(f => f.FileIndex).Distinct().ToList());

            Mocker.GetMock<ISiteRipDownloadFileRepository>()
                  .Setup(r => r.DeleteForEpisodes(SiteRipDownloadId, It.IsAny<IEnumerable<int>>()))
                  .Callback<int, IEnumerable<int>>((_, episodeIds) =>
                  {
                      var ids = episodeIds.ToList();
                      _deletedEpisodeIds.AddRange(ids);
                      _files.RemoveAll(f => ids.Contains(f.EpisodeId));
                      _grabbedHistory.RemoveAll(h => ids.Contains(h.EpisodeId));
                  });

            Mocker.GetMock<IHistoryService>()
                  .Setup(h => h.Find(TorrentHash, EpisodeHistoryEventType.Grabbed))
                  .Returns(() => _grabbedHistory.ToList());

            Mocker.GetMock<IHistoryService>()
                  .Setup(h => h.DeleteGrabbed(TorrentHash, It.IsAny<IEnumerable<int>>()))
                  .Callback<string, IEnumerable<int>>((_, episodeIds) => _deleteGrabbedCalls.Add(episodeIds.ToList()));

            var downloadClient = new Mock<IDownloadClient>();
            downloadClient.Setup(c => c.RemoveItem(It.IsAny<DownloadClientItem>(), It.IsAny<bool>()))
                          .Callback(() => _removeItemCalled = true);

            Mocker.GetMock<IProvideDownloadClient>()
                  .Setup(p => p.Get(It.IsAny<int>()))
                  .Returns(downloadClient.Object);

            Mocker.GetMock<ITrackedDownloadService>()
                  .Setup(s => s.RemoveEpisodes(It.IsAny<string>(), It.IsAny<IEnumerable<int>>()));
        }

        [Test]
        public void should_unwant_cancelled_scene_and_keep_torrent_when_other_scenes_remain()
        {
            var trackedDownload = CreateTrackedDownload();

            var result = Subject.CancelEpisodes(TorrentHash, new[] { 42 }, new SiteRipCancelOptions
            {
                RemoveFromClient = true,
                TrackedDownload = trackedDownload
            });

            result.TorrentRemoved.Should().BeFalse();
            result.HasRemainingScenes.Should().BeTrue();
            _removeItemCalled.Should().BeFalse();
            _unwantedIndicesPassed.Should().BeEquivalentTo(new[] { 10 });
            _wantedIndicesPassed.Should().BeNull();
            _deletedEpisodeIds.Should().BeEquivalentTo(new[] { 42 });
            _deleteGrabbedCalls.Should().ContainSingle().Which.Should().BeEquivalentTo(new[] { 42 });
        }

        [Test]
        public void should_keep_torrent_when_other_scenes_in_history_without_file_rows()
        {
            _files.Clear();
            _files.Add(new SiteRipDownloadFile { Id = 1, SiteRipDownloadId = SiteRipDownloadId, EpisodeId = 42, FileIndex = 10, Imported = false });
            _grabbedHistory.Add(new EpisodeHistory { EpisodeId = 44, SeriesId = 1, DownloadId = TorrentHash, EventType = EpisodeHistoryEventType.Grabbed, Data = new Dictionary<string, string>() });

            var result = Subject.CancelEpisodes(TorrentHash, new[] { 42 }, new SiteRipCancelOptions
            {
                RemoveFromClient = true,
                TrackedDownload = CreateTrackedDownload()
            });

            result.TorrentRemoved.Should().BeFalse();
            result.HasRemainingScenes.Should().BeTrue();
            _removeItemCalled.Should().BeFalse();
            _unwantedIndicesPassed.Should().BeEquivalentTo(new[] { 10 });
            _wantedIndicesPassed.Should().BeNull();
        }

        [Test]
        public void should_remove_torrent_when_last_scene_cancelled_with_remove_from_client()
        {
            var trackedDownload = CreateTrackedDownload();

            var result = Subject.CancelEpisodes(TorrentHash, new[] { 42, 43 }, new SiteRipCancelOptions
            {
                RemoveFromClient = true,
                TrackedDownload = trackedDownload
            });

            result.TorrentRemoved.Should().BeTrue();
            result.HasRemainingScenes.Should().BeFalse();
            _removeItemCalled.Should().BeTrue();
            _unwantedIndicesPassed.Should().BeEquivalentTo(new[] { 10, 20 });
            _wantedIndicesPassed.Should().BeNull();
            _deleteGrabbedCalls.Should().ContainSingle().Which.Should().BeEquivalentTo(new[] { 42, 43 });
        }

        [Test]
        public void should_delete_site_rip_file_rows_for_cancelled_episode()
        {
            Subject.CancelEpisodes(TorrentHash, new[] { 42 }, new SiteRipCancelOptions
            {
                RemoveFromClient = true,
                TrackedDownload = CreateTrackedDownload()
            });

            _files.Should().ContainSingle();
            _files[0].EpisodeId.Should().Be(43);
        }

        [Test]
        public void should_publish_download_failed_per_episode_when_blocklisting()
        {
            var publishedEvents = new List<DownloadFailedEvent>();
            Mocker.GetMock<IEventAggregator>()
                  .Setup(e => e.PublishEvent(It.IsAny<DownloadFailedEvent>()))
                  .Callback<DownloadFailedEvent>(publishedEvents.Add);

            Subject.CancelEpisodes(TorrentHash, new[] { 42 }, new SiteRipCancelOptions
            {
                Blocklist = true,
                TrackedDownload = CreateTrackedDownload()
            });

            publishedEvents.Should().ContainSingle();
            publishedEvents[0].EpisodeIds.Should().BeEquivalentTo(new[] { 42 });
            publishedEvents[0].TrackedDownload.Should().BeNull();
        }

        [Test]
        public void should_unwant_only_cancelled_scenes_when_cancelling_multiple_scenes_in_bulk()
        {
            _files.Add(new SiteRipDownloadFile { Id = 3, SiteRipDownloadId = SiteRipDownloadId, EpisodeId = 44, FileIndex = 30, Imported = false });
            _grabbedHistory.Add(new EpisodeHistory { EpisodeId = 44, SeriesId = 1, DownloadId = TorrentHash, EventType = EpisodeHistoryEventType.Grabbed, Data = new Dictionary<string, string>() });

            Subject.CancelEpisodes(TorrentHash, new[] { 42, 43 }, new SiteRipCancelOptions
            {
                RemoveFromClient = true,
                TrackedDownload = CreateTrackedDownload()
            });

            _unwantedIndicesPassed.Should().BeEquivalentTo(new[] { 10, 20 });
            _wantedIndicesPassed.Should().BeNull();
            _removeItemCalled.Should().BeFalse();
        }

        private void GivenQBitClient()
        {
            var proxyMock = Mocker.GetMock<IQBittorrentProxy>();

            Mocker.GetMock<IQBittorrentProxySelector>()
                  .Setup(s => s.GetProxy(It.IsAny<QBittorrentSettings>(), It.IsAny<bool>()))
                  .Returns(proxyMock.Object);

            proxyMock.Setup(s => s.GetConfig(It.IsAny<QBittorrentSettings>()))
                     .Returns(new QBittorrentPreferences { DhtEnabled = true });

            proxyMock.Setup(s => s.SetFilesWanted(It.IsAny<string>(), It.IsAny<IEnumerable<int>>(), It.IsAny<QBittorrentSettings>()))
                     .Callback<string, IEnumerable<int>, QBittorrentSettings>((hash, indices, settings) =>
                     {
                         _wantedIndicesPassed = indices.OrderBy(i => i).ToList();
                     });

            proxyMock.Setup(s => s.SetFilesUnwanted(It.IsAny<string>(), It.IsAny<IEnumerable<int>>(), It.IsAny<QBittorrentSettings>()))
                     .Callback<string, IEnumerable<int>, QBittorrentSettings>((hash, indices, settings) =>
                     {
                         _unwantedIndicesPassed = indices.OrderBy(i => i).ToList();
                     });

            proxyMock.Setup(s => s.PauseTorrent(It.IsAny<string>(), It.IsAny<QBittorrentSettings>()));
            proxyMock.Setup(s => s.ResumeTorrent(It.IsAny<string>(), It.IsAny<QBittorrentSettings>()));

            var qbit = Mocker.Resolve<QBittorrent>();
            qbit.Definition = new DownloadClientDefinition
            {
                Id = 1,
                Name = "qBittorrent",
                Enable = true,
                Settings = new QBittorrentSettings
                {
                    Host = "127.0.0.1",
                    Port = 8080,
                    Username = "user",
                    Password = "pass",
                    TvCategory = "tv"
                }
            };

            Mocker.GetMock<IDownloadClientFactory>()
                  .Setup(f => f.GetAvailableProviders())
                  .Returns(new List<IDownloadClient> { qbit });
        }

        private static TrackedDownload CreateTrackedDownload()
        {
            return new TrackedDownload
            {
                DownloadClient = 1,
                DownloadItem = new DownloadClientItem
                {
                    DownloadId = TorrentHash,
                    Title = "Test Pack"
                },
                RemoteEpisode = new RemoteEpisode
                {
                    Series = new Series { Id = 1, Title = "Test Series" },
                    Episodes = new List<Episode>
                    {
                        new Episode { Id = 42, SeriesId = 1 },
                        new Episode { Id = 43, SeriesId = 1 }
                    },
                    ParsedEpisodeInfo = new ParsedEpisodeInfo()
                }
            };
        }
    }
}
