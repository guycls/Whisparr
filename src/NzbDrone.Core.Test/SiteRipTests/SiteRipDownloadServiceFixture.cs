using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Common.Http;
using NzbDrone.Core.Download;
using NzbDrone.Core.Download.Clients;
using NzbDrone.Core.Download.Clients.QBittorrent;
using NzbDrone.Core.Indexers;
using NzbDrone.Core.MediaFiles.TorrentInfo;
using NzbDrone.Core.Messaging.Events;
using NzbDrone.Core.Parser.Model;
using NzbDrone.Core.SiteRip;
using NzbDrone.Core.Test.Framework;
using NzbDrone.Core.Tv;

namespace NzbDrone.Core.Test.SiteRipTests
{
    [TestFixture]
    public class SiteRipDownloadServiceFixture : CoreTest<SiteRipDownloadService>
    {
        private const string TorrentHash = "CBC2F069FE8BB2F544EAE707D75BCD3DE9DCF951";
        private const int SiteRipDownloadId = 5;

        private List<int> _wantedIndicesPassed;
        private int _fileInsertCount;
        private int _fileUpdateCount;

        [SetUp]
        public void Setup()
        {
            _wantedIndicesPassed = null;
            _fileInsertCount = 0;
            _fileUpdateCount = 0;

            GivenQBitClient();

            Mocker.GetMock<ISeriesService>()
                  .Setup(s => s.GetSeries(It.IsAny<int>()))
                  .Returns(new Series { Id = 1, Title = "Test Series" });

            Mocker.GetMock<IEpisodeService>()
                  .Setup(s => s.GetEpisodes(It.IsAny<IEnumerable<int>>()))
                  .Returns((IEnumerable<int> ids) => ids.Select(id => new Episode { Id = id, SeriesId = 1, Title = $"Episode {id}" }).ToList());

            Mocker.GetMock<ISeedConfigProvider>()
                  .Setup(s => s.GetSeedConfiguration(It.IsAny<RemoteEpisode>()))
                  .Returns((TorrentSeedConfiguration)null);

            Mocker.GetMock<IEventAggregator>()
                  .Setup(e => e.PublishEvent(It.IsAny<EpisodeGrabbedEvent>()));

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
                  .Setup(r => r.Update(It.IsAny<SiteRipDownloadFile>()))
                  .Callback(() => _fileUpdateCount++);

            Mocker.GetMock<ISiteRipDownloadFileRepository>()
                  .Setup(r => r.Insert(It.IsAny<SiteRipDownloadFile>()))
                  .Callback(() => _fileInsertCount++);
        }

        [Test]
        public async Task should_merge_pending_file_indices_on_regrab()
        {
            Mocker.GetMock<ISiteRipPendingFileService>()
                  .Setup(s => s.GetPendingFiles(SiteRipDownloadId))
                  .Returns(new List<SiteRipDownloadFile>
                  {
                      new SiteRipDownloadFile { EpisodeId = 1, FileIndex = 10, Imported = false },
                      new SiteRipDownloadFile { EpisodeId = 2, FileIndex = 20, Imported = true }
                  });

            Mocker.GetMock<ISiteRipDownloadFileRepository>()
                  .Setup(r => r.GetByDownloadId(SiteRipDownloadId))
                  .Returns(new List<SiteRipDownloadFile>());

            await Subject.Grab(CreateRemoteEpisode(), 1, new List<SiteRipGrabSelection>
            {
                new SiteRipGrabSelection { EpisodeId = 3, FileIndices = new List<int> { 30 } },
                new SiteRipGrabSelection { EpisodeId = 4, FileIndices = new List<int> { 40 } }
            });

            _wantedIndicesPassed.Should().BeEquivalentTo(new[] { 10, 20, 30, 40 });
        }

        [Test]
        public async Task should_not_merge_completed_episode_files()
        {
            Mocker.GetMock<ISiteRipPendingFileService>()
                  .Setup(s => s.GetPendingFiles(SiteRipDownloadId))
                  .Returns(new List<SiteRipDownloadFile>());

            Mocker.GetMock<ISiteRipDownloadFileRepository>()
                  .Setup(r => r.GetByDownloadId(SiteRipDownloadId))
                  .Returns(new List<SiteRipDownloadFile>
                  {
                      new SiteRipDownloadFile { EpisodeId = 1, FileIndex = 10, Imported = true },
                      new SiteRipDownloadFile { EpisodeId = 2, FileIndex = 20, Imported = true }
                  });

            await Subject.Grab(CreateRemoteEpisode(), 1, new List<SiteRipGrabSelection>
            {
                new SiteRipGrabSelection { EpisodeId = 3, FileIndices = new List<int> { 30 } },
                new SiteRipGrabSelection { EpisodeId = 4, FileIndices = new List<int> { 40 } }
            });

            _wantedIndicesPassed.Should().BeEquivalentTo(new[] { 30, 40 });
        }

        [Test]
        public async Task should_not_insert_duplicate_site_rip_download_file_rows()
        {
            Mocker.GetMock<ISiteRipPendingFileService>()
                  .Setup(s => s.GetPendingFiles(SiteRipDownloadId))
                  .Returns(new List<SiteRipDownloadFile>());

            Mocker.GetMock<ISiteRipDownloadFileRepository>()
                  .Setup(r => r.GetByDownloadId(SiteRipDownloadId))
                  .Returns(new List<SiteRipDownloadFile>
                  {
                      new SiteRipDownloadFile { EpisodeId = 100, FileIndex = 10, Imported = false }
                  });

            await Subject.Grab(CreateRemoteEpisode(), 1, new List<SiteRipGrabSelection>
            {
                new SiteRipGrabSelection { EpisodeId = 100, FileIndices = new List<int> { 10 } },
                new SiteRipGrabSelection { EpisodeId = 101, FileIndices = new List<int> { 30 } }
            });

            _fileInsertCount.Should().Be(1);
            _fileUpdateCount.Should().Be(0);
        }

        [Test]
        public async Task should_reset_imported_flag_when_regrabbing_existing_file_row()
        {
            Mocker.GetMock<ISiteRipPendingFileService>()
                  .Setup(s => s.GetPendingFiles(SiteRipDownloadId))
                  .Returns(new List<SiteRipDownloadFile>());

            var existingFile = new SiteRipDownloadFile
            {
                Id = 99,
                EpisodeId = 100,
                FileIndex = 10,
                Imported = true
            };

            Mocker.GetMock<ISiteRipDownloadFileRepository>()
                  .Setup(r => r.GetByDownloadId(SiteRipDownloadId))
                  .Returns(new List<SiteRipDownloadFile> { existingFile });

            await Subject.Grab(CreateRemoteEpisode(), 1, new List<SiteRipGrabSelection>
            {
                new SiteRipGrabSelection { EpisodeId = 100, FileIndices = new List<int> { 10 } }
            });

            _fileInsertCount.Should().Be(0);
            _fileUpdateCount.Should().Be(1);
            existingFile.Imported.Should().BeFalse();
        }

        private void GivenQBitClient()
        {
            var proxyMock = Mocker.GetMock<IQBittorrentProxy>();

            Mocker.GetMock<IQBittorrentProxySelector>()
                  .Setup(s => s.GetProxy(It.IsAny<QBittorrentSettings>(), It.IsAny<bool>()))
                  .Returns(proxyMock.Object);

            proxyMock.Setup(s => s.GetConfig(It.IsAny<QBittorrentSettings>()))
                     .Returns(new QBittorrentPreferences { DhtEnabled = true });

            proxyMock.Setup(s => s.AddTorrentFromFile(It.IsAny<string>(), It.IsAny<byte[]>(), It.IsAny<TorrentSeedConfiguration>(), It.IsAny<QBittorrentSettings>()));

            proxyMock.Setup(s => s.IsTorrentLoaded(It.IsAny<string>(), It.IsAny<QBittorrentSettings>()))
                     .Returns(true);

            proxyMock.Setup(s => s.SetFilesWanted(It.IsAny<string>(), It.IsAny<IEnumerable<int>>(), It.IsAny<QBittorrentSettings>()))
                     .Callback<string, IEnumerable<int>, QBittorrentSettings>((hash, indices, settings) =>
                     {
                         _wantedIndicesPassed = indices.OrderBy(i => i).ToList();
                     });

            proxyMock.Setup(s => s.PauseTorrent(It.IsAny<string>(), It.IsAny<QBittorrentSettings>()));
            proxyMock.Setup(s => s.ResumeTorrent(It.IsAny<string>(), It.IsAny<QBittorrentSettings>()));

            Mocker.GetMock<ITorrentFileInfoReader>()
                  .Setup(s => s.GetHashFromTorrentFile(It.IsAny<byte[]>()))
                  .Returns(TorrentHash);

            Mocker.GetMock<IHttpClient>()
                  .Setup(s => s.Get(It.IsAny<HttpRequest>()))
                  .Returns<HttpRequest>(r => new HttpResponse(r, new HttpHeader(), new byte[] { 1 }));

            Mocker.GetMock<IHttpClient>()
                  .Setup(s => s.GetAsync(It.IsAny<HttpRequest>()))
                  .Returns<HttpRequest>(r => Task.FromResult(new HttpResponse(r, new HttpHeader(), new byte[] { 1 })));

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

        private static RemoteEpisode CreateRemoteEpisode()
        {
            return new RemoteEpisode
            {
                Release = new ReleaseInfo
                {
                    Title = "SiteRIP Pack",
                    DownloadUrl = "http://test.whisparr.tv/release.torrent",
                    DownloadProtocol = DownloadProtocol.Torrent
                },
                ParsedEpisodeInfo = new ParsedEpisodeInfo()
            };
        }
    }
}
