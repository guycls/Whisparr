using System;
using System.Collections.Generic;
using System.IO;
using FizzWare.NBuilder;
using Moq;
using NUnit.Framework;
using NzbDrone.Common.Disk;
using NzbDrone.Core.MediaFiles;
using NzbDrone.Core.Test.Framework;
using NzbDrone.Core.Tv;
using NzbDrone.Test.Common;

namespace NzbDrone.Core.Test.MediaFiles
{
    [TestFixture]
    public class HardLinkScanServiceFixture : CoreTest<HardLinkScanService>
    {
        private string _mountRoot;
        private string _seriesAPath;
        private string _seriesBPath;
        private string _downloadsPath;
        private string _fileA;
        private string _fileB;
        private string _downloadA;
        private Series _seriesA;
        private Series _seriesB;
        private EpisodeFile _episodeFileA;
        private EpisodeFile _episodeFileB;

        [SetUp]
        public void Setup()
        {
            _mountRoot = @"C:\mnt".AsOsAgnostic();
            _seriesAPath = Path.Combine(_mountRoot, "SeriesA");
            _seriesBPath = Path.Combine(_mountRoot, "SeriesB");
            _downloadsPath = Path.Combine(_mountRoot, "downloads");
            _fileA = Path.Combine(_seriesAPath, "a.mkv");
            _fileB = Path.Combine(_seriesBPath, "b.mkv");
            _downloadA = Path.Combine(_downloadsPath, "a.mkv");

            _seriesA = Builder<Series>.CreateNew()
                                      .With(s => s.Id = 1)
                                      .With(s => s.Path = _seriesAPath)
                                      .Build();

            _seriesB = Builder<Series>.CreateNew()
                                      .With(s => s.Id = 2)
                                      .With(s => s.Path = _seriesBPath)
                                      .Build();

            _episodeFileA = Builder<EpisodeFile>.CreateNew()
                                                .With(f => f.Id = 10)
                                                .With(f => f.SeriesId = _seriesA.Id)
                                                .With(f => f.RelativePath = "a.mkv")
                                                .Build();

            _episodeFileB = Builder<EpisodeFile>.CreateNew()
                                                .With(f => f.Id = 11)
                                                .With(f => f.SeriesId = _seriesB.Id)
                                                .With(f => f.RelativePath = "b.mkv")
                                                .Build();

            var mount = new Mock<IMount>();
            mount.SetupGet(m => m.RootDirectory).Returns(_mountRoot);

            var disk = Mocker.GetMock<IDiskProvider>();

            disk.Setup(d => d.GetMount(It.IsAny<string>())).Returns(mount.Object);
            disk.Setup(d => d.GetDirectories(It.IsAny<string>())).Returns(Array.Empty<string>());
            disk.Setup(d => d.GetDirectories(_mountRoot)).Returns(new[] { _seriesAPath, _seriesBPath, _downloadsPath });
            disk.Setup(d => d.GetFiles(It.IsAny<string>(), false)).Returns(Array.Empty<string>());
            disk.Setup(d => d.GetFiles(_seriesAPath, false)).Returns(new[] { _fileA });
            disk.Setup(d => d.GetFiles(_seriesBPath, false)).Returns(new[] { _fileB });
            disk.Setup(d => d.GetFiles(_downloadsPath, false)).Returns(new[] { _downloadA });
            disk.Setup(d => d.GetFileLinkIdentity(It.IsAny<string>())).Returns((FileLinkIdentity)null);
            disk.Setup(d => d.GetFileLinkIdentity(_mountRoot)).Returns(Identity("vol", "root", 1));
            disk.Setup(d => d.GetFileLinkIdentity(_seriesAPath)).Returns(Identity("vol", "dir-a", 1));
            disk.Setup(d => d.GetFileLinkIdentity(_seriesBPath)).Returns(Identity("vol", "dir-b", 1));
            disk.Setup(d => d.GetFileLinkIdentity(_downloadsPath)).Returns(Identity("vol", "dir-d", 1));
            disk.Setup(d => d.GetFileLinkIdentity(_fileA)).Returns(Identity("vol", "99", 2));
            disk.Setup(d => d.GetFileLinkIdentity(_downloadA)).Returns(Identity("vol", "99", 2));
            disk.Setup(d => d.GetFileLinkIdentity(_fileB)).Returns(Identity("vol", "1", 1));

            Mocker.GetMock<ISeriesService>()
                  .Setup(s => s.GetAllSeries())
                  .Returns(new List<Series> { _seriesA, _seriesB });

            Mocker.GetMock<IMediaFileService>()
                  .Setup(s => s.GetFilesBySeries(_seriesA.Id))
                  .Returns(new List<EpisodeFile> { _episodeFileA });

            Mocker.GetMock<IMediaFileService>()
                  .Setup(s => s.GetFilesBySeries(_seriesB.Id))
                  .Returns(new List<EpisodeFile> { _episodeFileB });
        }

        [Test]
        public void should_walk_a_shared_mount_once_and_store_hard_links()
        {
            Subject.UpdateHardLinks(new List<Series> { _seriesA, _seriesB });

            Mocker.GetMock<IDiskProvider>().Verify(d => d.GetDirectories(_mountRoot), Times.Once());
            Mocker.GetMock<IDiskProvider>().Verify(d => d.GetFiles(_mountRoot, true), Times.Never());

            Mocker.GetMock<IMediaFileService>().Verify(s => s.SetHardLinkIdentity(It.Is<EpisodeFile>(f => f.Id == _episodeFileA.Id && f.HardLinkVolumeId == "vol" && f.HardLinkFileId == "99")), Times.Once());
            Mocker.GetMock<IMediaFileService>().Verify(s => s.SetHardLinkIdentity(It.Is<EpisodeFile>(f => f.Id == _episodeFileB.Id && f.HardLinkVolumeId == "vol" && f.HardLinkFileId == "1")), Times.Once());

            Mocker.GetMock<IEpisodeFileHardLinkRepository>().Verify(r => r.ReplacePaths(_episodeFileA.Id, It.Is<List<string>>(paths => paths.Count == 2 && paths.Contains(_fileA) && paths.Contains(_downloadA))), Times.Once());
            Mocker.GetMock<IEpisodeFileHardLinkRepository>().Verify(r => r.ReplacePaths(_episodeFileB.Id, It.Is<List<string>>(paths => paths.Count == 1 && paths.Contains(_fileB))), Times.Once());
        }

        private static FileLinkIdentity Identity(string volumeId, string fileId, int linkCount)
        {
            return new FileLinkIdentity
            {
                VolumeId = volumeId,
                FileId = fileId,
                LinkCount = linkCount
            };
        }
    }
}
