using System.Collections.Generic;
using System.IO;
using System.Linq;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Common.Disk;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.Download;
using NzbDrone.Core.Download.Clients;
using NzbDrone.Core.Download.Clients.QBittorrent;
using NzbDrone.Core.Download.TrackedDownloads;
using NzbDrone.Core.MediaFiles;
using NzbDrone.Core.DecisionEngine;
using NzbDrone.Core.MediaFiles.EpisodeImport;
using NzbDrone.Core.Parser.Model;
using NzbDrone.Core.RemotePathMappings;
using NzbDrone.Core.SiteRip;
using NzbDrone.Core.Test.Framework;
using NzbDrone.Core.Tv;
using NzbDrone.Test.Common;

namespace NzbDrone.Core.Test.SiteRipTests
{
    [TestFixture]
    public class SiteRipImportServiceFixture : CoreTest<SiteRipImportService>
    {
        private const string TorrentHash = "CBC2F069FE8BB2F544EAE707D75BCD3DE9DCF951";
        private const int SiteRipDownloadId = 5;
        private const string TorrentFileName = "PackFolder/[PTD] - Test Scene.mp4";
        private const string SavePath = @"C:\downloads";
        private string _resolvedFilePath;

        private QBittorrent _qbit;
        private List<SiteRipDownloadFile> _updatedFiles;

        [SetUp]
        public void Setup()
        {
            _updatedFiles = new List<SiteRipDownloadFile>();

            GivenQBitClient();

            Mocker.GetMock<IRemotePathMappingService>()
                  .Setup(s => s.RemapRemoteToLocal(It.IsAny<string>(), It.IsAny<OsPath>()))
                  .Returns<string, OsPath>((host, path) => path);

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
                  .Setup(r => r.GetByDownloadId(SiteRipDownloadId))
                  .Returns(new List<SiteRipDownloadFile>
                  {
                      new SiteRipDownloadFile { Id = 1, EpisodeId = 42, FileIndex = 10, Imported = false }
                  });

            Mocker.GetMock<ISiteRipDownloadFileRepository>()
                  .Setup(r => r.GetUnimportedByDownloadId(SiteRipDownloadId))
                  .Returns(new List<SiteRipDownloadFile>
                  {
                      new SiteRipDownloadFile { Id = 1, EpisodeId = 42, FileIndex = 10, Imported = false }
                  });

            Mocker.GetMock<ISiteRipDownloadFileRepository>()
                  .Setup(r => r.Update(It.IsAny<SiteRipDownloadFile>()))
                  .Callback<SiteRipDownloadFile>(f => _updatedFiles.Add(f));

            Mocker.SetConstant<ISiteRipPendingFileService>(new SiteRipPendingFileService(
                Mocker.Resolve<ISiteRipDownloadFileRepository>(),
                Mocker.Resolve<IEpisodeService>()));

            Mocker.GetMock<ISeriesService>()
                  .Setup(s => s.GetSeries(1))
                  .Returns(new Series { Id = 1, Title = "Test Series" });

            Mocker.GetMock<IEpisodeService>()
                  .Setup(s => s.GetEpisodes(It.IsAny<IEnumerable<int>>()))
                  .Returns(new List<Episode> { new Episode { Id = 42, EpisodeFileId = 0 } });

            Mocker.GetMock<IDiskProvider>()
                  .Setup(d => d.FileExists(It.IsAny<string>()))
                  .Returns<string>(path =>
                  {
                      return !path.IsNullOrWhiteSpace();
                  });

            GivenSuccessfulImport();
        }

        private void GivenSuccessfulImport()
        {
            Mocker.GetMock<IDownloadedEpisodesImportService>()
                  .Setup(s => s.ProcessPath(It.IsAny<string>(), It.IsAny<ImportMode>(), It.IsAny<Series>(), It.IsAny<DownloadClientItem>(), It.IsAny<List<int>>()))
                  .Returns(new List<ImportResult>
                  {
                      new ImportResult(new ImportDecision(new LocalEpisode(), new Rejection("test")), new EpisodeFile())
                  });
        }

        [Test]
        public void should_resolve_torrent_file_path_from_save_path()
        {
            _qbit.GetTorrentFileFullPath(TorrentHash, TorrentFileName)
                 .Should().Be(_resolvedFilePath);
        }

        [Test]
        public void should_import_using_torrent_save_path_when_output_path_empty()
        {
            var trackedDownload = CreateTrackedDownload(outputPath: string.Empty);

            Subject.ProcessActiveDownloads(new[] { trackedDownload });

            Mocker.GetMock<IDownloadedEpisodesImportService>()
                  .Verify(s => s.ProcessPath(_resolvedFilePath, ImportMode.Auto, It.IsAny<Series>(), trackedDownload.DownloadItem, new List<int> { 42 }), Times.Once);

            _updatedFiles.Should().ContainSingle();
            _updatedFiles[0].Imported.Should().BeTrue();
        }

        [Test]
        public void should_not_mark_imported_when_file_not_on_disk()
        {
            Mocker.GetMock<IDiskProvider>()
                  .Setup(d => d.FileExists(It.IsAny<string>()))
                  .Returns(false);

            var trackedDownload = CreateTrackedDownload(outputPath: string.Empty);

            Subject.ProcessActiveDownloads(new[] { trackedDownload });

            Mocker.GetMock<IDownloadedEpisodesImportService>()
                  .Verify(s => s.ProcessPath(It.IsAny<string>(), It.IsAny<ImportMode>(), It.IsAny<Series>(), It.IsAny<DownloadClientItem>(), It.IsAny<List<int>>()), Times.Never);

            _updatedFiles.Should().BeEmpty();
        }

        [Test]
        public void should_process_untrackable_downloads()
        {
            var trackedDownload = CreateTrackedDownload(outputPath: string.Empty);
            trackedDownload.IsTrackable = false;

            Subject.ProcessActiveDownloads(new[] { trackedDownload });

            Mocker.GetMock<IDownloadedEpisodesImportService>()
                  .Verify(s => s.ProcessPath(_resolvedFilePath, ImportMode.Auto, It.IsAny<Series>(), trackedDownload.DownloadItem, new List<int> { 42 }), Times.Once);
        }

        [Test]
        public void should_retry_import_when_marked_imported_but_episode_has_no_file()
        {
            Mocker.GetMock<ISiteRipDownloadFileRepository>()
                  .Setup(r => r.GetByDownloadId(SiteRipDownloadId))
                  .Returns(new List<SiteRipDownloadFile>
                  {
                      new SiteRipDownloadFile { Id = 1, EpisodeId = 42, FileIndex = 10, Imported = true }
                  });

            Mocker.GetMock<IEpisodeService>()
                  .Setup(s => s.GetEpisodes(It.IsAny<IEnumerable<int>>()))
                  .Returns(new List<Episode> { new Episode { Id = 42, EpisodeFileId = 0 } });

            var trackedDownload = CreateTrackedDownload(outputPath: string.Empty);

            Subject.ProcessActiveDownloads(new[] { trackedDownload });

            Mocker.GetMock<IDownloadedEpisodesImportService>()
                  .Verify(s => s.ProcessPath(_resolvedFilePath, ImportMode.Auto, It.IsAny<Series>(), trackedDownload.DownloadItem, new List<int> { 42 }), Times.Once);
        }

        [Test]
        public void should_not_mark_imported_when_import_fails()
        {
            Mocker.GetMock<IDownloadedEpisodesImportService>()
                  .Setup(s => s.ProcessPath(It.IsAny<string>(), It.IsAny<ImportMode>(), It.IsAny<Series>(), It.IsAny<DownloadClientItem>(), It.IsAny<List<int>>()))
                  .Returns(new List<ImportResult>
                  {
                      new ImportResult(new ImportDecision(new LocalEpisode(), new Rejection("test")), "Failed to import episode")
                  });

            var trackedDownload = CreateTrackedDownload(outputPath: string.Empty);

            Subject.ProcessActiveDownloads(new[] { trackedDownload });

            _updatedFiles.Should().ContainSingle();
            _updatedFiles[0].Imported.Should().BeFalse();
        }

        [Test]
        public void should_reset_imported_flag_when_torrent_files_not_complete()
        {
            var proxyMock = Mocker.GetMock<IQBittorrentProxy>();
            proxyMock.Setup(s => s.GetTorrentFiles(It.IsAny<string>(), It.IsAny<QBittorrentSettings>()))
                     .Returns(new List<QBittorrentTorrentFile>
                     {
                         new QBittorrentTorrentFile { Index = 10, Name = TorrentFileName, Progress = 0.5, Size = 1000 }
                     });

            Mocker.GetMock<ISiteRipDownloadFileRepository>()
                  .Setup(r => r.GetByDownloadId(SiteRipDownloadId))
                  .Returns(new List<SiteRipDownloadFile>
                  {
                      new SiteRipDownloadFile { Id = 1, EpisodeId = 42, FileIndex = 10, Imported = true }
                  });

            var trackedDownload = CreateTrackedDownload(outputPath: string.Empty);

            Subject.ProcessActiveDownloads(new[] { trackedDownload });

            _updatedFiles.Should().ContainSingle();
            _updatedFiles[0].Imported.Should().BeFalse();
        }

        [Test]
        public void should_reset_imported_flag_when_import_deferred_waiting_for_files_on_disk()
        {
            Mocker.GetMock<IDiskProvider>()
                  .Setup(d => d.FileExists(It.IsAny<string>()))
                  .Returns(false);

            Mocker.GetMock<ISiteRipDownloadFileRepository>()
                  .Setup(r => r.GetByDownloadId(SiteRipDownloadId))
                  .Returns(new List<SiteRipDownloadFile>
                  {
                      new SiteRipDownloadFile { Id = 1, EpisodeId = 42, FileIndex = 10, Imported = true }
                  });

            var trackedDownload = CreateTrackedDownload(outputPath: string.Empty);

            Subject.ProcessActiveDownloads(new[] { trackedDownload });

            _updatedFiles.Should().ContainSingle();
            _updatedFiles[0].Imported.Should().BeFalse();
        }

        private void GivenQBitClient()
        {
            var savePath = SavePath.AsOsAgnostic();
            _resolvedFilePath = Path.Combine(savePath, TorrentFileName.Replace('/', Path.DirectorySeparatorChar));

            var proxyMock = Mocker.GetMock<IQBittorrentProxy>();

            Mocker.GetMock<IQBittorrentProxySelector>()
                  .Setup(s => s.GetProxy(It.IsAny<QBittorrentSettings>(), It.IsAny<bool>()))
                  .Returns(proxyMock.Object);

            proxyMock.Setup(s => s.GetTorrentFiles(It.IsAny<string>(), It.IsAny<QBittorrentSettings>()))
                     .Returns(new List<QBittorrentTorrentFile>
                     {
                         new QBittorrentTorrentFile { Index = 10, Name = TorrentFileName, Progress = 1.0, Size = 1000 }
                     });

            proxyMock.Setup(s => s.GetTorrentProperties(It.IsAny<string>(), It.IsAny<QBittorrentSettings>()))
                     .Returns(new QBittorrentTorrentProperties { SavePath = savePath });

            _qbit = Mocker.Resolve<QBittorrent>();
            _qbit.Definition = new DownloadClientDefinition
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
                  .Returns(new List<IDownloadClient> { _qbit });
        }

        private static TrackedDownload CreateTrackedDownload(string outputPath)
        {
            return new TrackedDownload
            {
                State = TrackedDownloadState.Downloading,
                IsTrackable = true,
                DownloadItem = new DownloadClientItem
                {
                    DownloadId = TorrentHash,
                    Title = "Test Pack",
                    OutputPath = new OsPath(outputPath)
                }
            };
        }
    }
}
