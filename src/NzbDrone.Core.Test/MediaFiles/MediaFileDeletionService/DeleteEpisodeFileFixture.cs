using System.Collections.Generic;
using System.IO;
using FizzWare.NBuilder;
using Moq;
using NUnit.Framework;
using NzbDrone.Common.Disk;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.Exceptions;
using NzbDrone.Core.MediaFiles;
using NzbDrone.Core.Test.Framework;
using NzbDrone.Core.Tv;
using NzbDrone.Test.Common;

namespace NzbDrone.Core.Test.MediaFiles.MediaFileDeletionService
{
    [TestFixture]
    public class DeleteEpisodeFileFixture : CoreTest<Core.MediaFiles.MediaFileDeletionService>
    {
        private const string ROOT_FOLDER = @"C:\Test\TV";
        private Series _series;
        private EpisodeFile _episodeFile;

        [SetUp]
        public void Setup()
        {
            _series = Builder<Series>.CreateNew()
                                     .With(s => s.Path = Path.Combine(ROOT_FOLDER, "Series Title"))
                                     .Build();

            _episodeFile = Builder<EpisodeFile>.CreateNew()
                                               .With(f => f.RelativePath = "Series Title - S01E01")
                                               .With(f => f.Path = Path.Combine(_series.Path, "Series Title - S01E01"))
                                               .Build();

            Mocker.GetMock<IDiskProvider>()
                  .Setup(s => s.GetParentFolder(_series.Path))
                  .Returns(ROOT_FOLDER);

            Mocker.GetMock<IDiskProvider>()
                  .Setup(s => s.GetParentFolder(_episodeFile.Path))
                  .Returns(_series.Path);
        }

        private void GivenRootFolderExists()
        {
            Mocker.GetMock<IDiskProvider>()
                  .Setup(s => s.FolderExists(ROOT_FOLDER))
                  .Returns(true);
        }

        private void GivenRootFolderHasFolders()
        {
            Mocker.GetMock<IDiskProvider>()
                  .Setup(s => s.GetDirectories(ROOT_FOLDER))
                  .Returns(new[] { _series.Path });
        }

        private void GivenSeriesFolderExists()
        {
            Mocker.GetMock<IDiskProvider>()
                  .Setup(s => s.FolderExists(_series.Path))
                  .Returns(true);
        }

        [Test]
        public void should_throw_if_root_folder_does_not_exist()
        {
            Assert.Throws<NzbDroneClientException>(() => Subject.DeleteEpisodeFile(_series, _episodeFile));
            ExceptionVerification.ExpectedWarns(1);
        }

        [Test]
        public void should_should_throw_if_root_folder_is_empty()
        {
            GivenRootFolderExists();

            Assert.Throws<NzbDroneClientException>(() => Subject.DeleteEpisodeFile(_series, _episodeFile));
            ExceptionVerification.ExpectedWarns(1);
        }

        [Test]
        public void should_delete_from_db_if_series_folder_does_not_exist()
        {
            GivenRootFolderExists();
            GivenRootFolderHasFolders();

            Subject.DeleteEpisodeFile(_series, _episodeFile);

            Mocker.GetMock<IMediaFileService>().Verify(v => v.Delete(_episodeFile, DeleteMediaFileReason.Manual), Times.Once());
            Mocker.GetMock<IRecycleBinProvider>().Verify(v => v.DeleteFile(_episodeFile.Path, It.IsAny<string>()), Times.Never());
        }

        [Test]
        public void should_delete_from_db_if_episode_file_does_not_exist()
        {
            GivenRootFolderExists();
            GivenRootFolderHasFolders();
            GivenSeriesFolderExists();

            Subject.DeleteEpisodeFile(_series, _episodeFile);

            Mocker.GetMock<IMediaFileService>().Verify(v => v.Delete(_episodeFile, DeleteMediaFileReason.Manual), Times.Once());
            Mocker.GetMock<IRecycleBinProvider>().Verify(v => v.DeleteFile(_episodeFile.Path, It.IsAny<string>()), Times.Never());
        }

        [Test]
        public void should_delete_from_disk_and_db_if_episode_file_exists()
        {
            GivenRootFolderExists();
            GivenRootFolderHasFolders();
            GivenSeriesFolderExists();

            Mocker.GetMock<IDiskProvider>()
                  .Setup(s => s.FileExists(_episodeFile.Path))
                  .Returns(true);

            Subject.DeleteEpisodeFile(_series, _episodeFile);

            Mocker.GetMock<IRecycleBinProvider>().Verify(v => v.DeleteFile(_episodeFile.Path, "Series Title"), Times.Once());
            Mocker.GetMock<IMediaFileService>().Verify(v => v.Delete(_episodeFile, DeleteMediaFileReason.Manual), Times.Once());
        }

        [Test]
        public void should_handle_error_deleting_episode_file()
        {
            GivenRootFolderExists();
            GivenRootFolderHasFolders();
            GivenSeriesFolderExists();

            Mocker.GetMock<IDiskProvider>()
                  .Setup(s => s.FileExists(_episodeFile.Path))
                  .Returns(true);

            Mocker.GetMock<IRecycleBinProvider>()
                  .Setup(s => s.DeleteFile(_episodeFile.Path, "Series Title"))
                  .Throws(new IOException());

            Assert.Throws<NzbDroneClientException>(() => Subject.DeleteEpisodeFile(_series, _episodeFile));

            ExceptionVerification.ExpectedErrors(1);
            Mocker.GetMock<IRecycleBinProvider>().Verify(v => v.DeleteFile(_episodeFile.Path, "Series Title"), Times.Once());
            Mocker.GetMock<IMediaFileService>().Verify(v => v.Delete(_episodeFile, DeleteMediaFileReason.Manual), Times.Never());
        }

        [Test]
        public void should_not_delete_other_hard_links_for_whisparr_entry()
        {
            GivenRootFolderExists();
            GivenRootFolderHasFolders();
            GivenSeriesFolderExists();

            var extraPath = @"C:\downloads\file.mkv".AsOsAgnostic();

            _episodeFile.HardLinkVolumeId = "vol";
            _episodeFile.HardLinkFileId = "99";

            Mocker.GetMock<IConfigService>()
                  .SetupGet(s => s.DeleteBehavior)
                  .Returns(DeleteBehavior.WhisparrEntry);

            Mocker.GetMock<IDiskProvider>()
                  .Setup(s => s.FileExists(_episodeFile.Path))
                  .Returns(true);

            Mocker.GetMock<IDiskProvider>()
                  .Setup(s => s.FileExists(extraPath))
                  .Returns(true);

            Subject.DeleteEpisodeFile(_series, _episodeFile);

            Mocker.GetMock<IRecycleBinProvider>().Verify(v => v.DeleteFile(_episodeFile.Path, "Series Title"), Times.Once());
            Mocker.GetMock<IDiskProvider>().Verify(v => v.DeleteFile(extraPath), Times.Never());
            Mocker.GetMock<IMediaFileService>().Verify(v => v.Delete(_episodeFile, DeleteMediaFileReason.Manual), Times.Once());
        }

        [Test]
        public void should_delete_stored_hard_links_for_underlying_file()
        {
            GivenRootFolderExists();
            GivenRootFolderHasFolders();
            GivenSeriesFolderExists();

            var extraPath = @"C:\downloads\file.mkv".AsOsAgnostic();
            var sibling = Builder<EpisodeFile>.CreateNew()
                                              .With(f => f.Id = 42)
                                              .With(f => f.SeriesId = 2)
                                              .With(f => f.RelativePath = "other.mkv")
                                              .With(f => f.HardLinkVolumeId = "vol")
                                              .With(f => f.HardLinkFileId = "99")
                                              .Build();

            _episodeFile.HardLinkVolumeId = "vol";
            _episodeFile.HardLinkFileId = "99";

            Mocker.GetMock<IConfigService>()
                  .SetupGet(s => s.DeleteBehavior)
                  .Returns(DeleteBehavior.UnderlyingFile);

            Mocker.GetMock<IMediaFileService>()
                  .Setup(s => s.Find(_episodeFile.Id))
                  .Returns(_episodeFile);

            Mocker.GetMock<IMediaFileService>()
                  .Setup(s => s.GetFilesByHardLinkIdentity("vol", "99"))
                  .Returns(new List<EpisodeFile> { _episodeFile, sibling });

            Mocker.GetMock<IEpisodeFileHardLinkRepository>()
                  .Setup(s => s.GetByEpisodeFileIds(It.IsAny<List<int>>()))
                  .Returns(new List<EpisodeFileHardLink>
                  {
                      new EpisodeFileHardLink { EpisodeFileId = _episodeFile.Id, Path = _episodeFile.Path },
                      new EpisodeFileHardLink { EpisodeFileId = sibling.Id, Path = extraPath }
                  });

            Mocker.GetMock<IDiskProvider>()
                  .Setup(s => s.FileExists(It.IsAny<string>()))
                  .Returns(true);

            Mocker.GetMock<IDiskProvider>()
                  .Setup(s => s.GetFileLinkIdentity(It.IsAny<string>()))
                  .Returns(new FileLinkIdentity { VolumeId = "vol", FileId = "99", LinkCount = 2 });

            Subject.DeleteEpisodeFile(_series, _episodeFile);

            Mocker.GetMock<IRecycleBinProvider>().Verify(v => v.DeleteFile(_episodeFile.Path, "Series Title"), Times.Once());
            Mocker.GetMock<IDiskProvider>().Verify(v => v.DeleteFile(extraPath), Times.Once());
            Mocker.GetMock<IMediaFileService>().Verify(v => v.Delete(_episodeFile, DeleteMediaFileReason.Manual), Times.Once());
            Mocker.GetMock<IMediaFileService>().Verify(v => v.Delete(sibling, DeleteMediaFileReason.Manual), Times.Once());
            Mocker.GetMock<IDiskProvider>().Verify(v => v.GetFiles(It.IsAny<string>(), true), Times.Never());
        }

        [Test]
        public void should_delete_only_tracked_file_when_hard_link_identity_is_stale()
        {
            GivenRootFolderExists();
            GivenRootFolderHasFolders();
            GivenSeriesFolderExists();

            var extraPath = @"C:\downloads\file.mkv".AsOsAgnostic();

            _episodeFile.HardLinkVolumeId = "vol";
            _episodeFile.HardLinkFileId = "99";

            Mocker.GetMock<IConfigService>()
                  .SetupGet(s => s.DeleteBehavior)
                  .Returns(DeleteBehavior.UnderlyingFile);

            Mocker.GetMock<IMediaFileService>()
                  .Setup(s => s.Find(_episodeFile.Id))
                  .Returns(_episodeFile);

            Mocker.GetMock<IDiskProvider>()
                  .Setup(s => s.FileExists(_episodeFile.Path))
                  .Returns(true);

            Mocker.GetMock<IDiskProvider>()
                  .Setup(s => s.GetFileLinkIdentity(_episodeFile.Path))
                  .Returns(new FileLinkIdentity { VolumeId = "vol", FileId = "100", LinkCount = 2 });

            Subject.DeleteEpisodeFile(_series, _episodeFile);

            Mocker.GetMock<IRecycleBinProvider>().Verify(v => v.DeleteFile(_episodeFile.Path, "Series Title"), Times.Once());
            Mocker.GetMock<IDiskProvider>().Verify(v => v.DeleteFile(extraPath), Times.Never());
            Mocker.GetMock<IMediaFileService>().Verify(v => v.GetFilesByHardLinkIdentity(It.IsAny<string>(), It.IsAny<string>()), Times.Never());
            Mocker.GetMock<IMediaFileService>().Verify(v => v.Delete(_episodeFile, DeleteMediaFileReason.Manual), Times.Once());
            Mocker.GetMock<IDiskProvider>().Verify(v => v.GetFiles(It.IsAny<string>(), true), Times.Never());
            ExceptionVerification.ExpectedWarns(1);
        }

        [Test]
        public void should_delete_only_tracked_file_when_hard_links_were_never_indexed()
        {
            GivenRootFolderExists();
            GivenRootFolderHasFolders();
            GivenSeriesFolderExists();

            Mocker.GetMock<IConfigService>()
                  .SetupGet(s => s.DeleteBehavior)
                  .Returns(DeleteBehavior.UnderlyingFile);

            Mocker.GetMock<IMediaFileService>()
                  .Setup(s => s.Find(_episodeFile.Id))
                  .Returns(_episodeFile);

            Mocker.GetMock<IDiskProvider>()
                  .Setup(s => s.FileExists(_episodeFile.Path))
                  .Returns(true);

            Subject.DeleteEpisodeFile(_series, _episodeFile);

            Mocker.GetMock<IRecycleBinProvider>().Verify(v => v.DeleteFile(_episodeFile.Path, "Series Title"), Times.Once());
            Mocker.GetMock<IMediaFileService>().Verify(v => v.GetFilesByHardLinkIdentity(It.IsAny<string>(), It.IsAny<string>()), Times.Never());
            Mocker.GetMock<IMediaFileService>().Verify(v => v.Delete(_episodeFile, DeleteMediaFileReason.Manual), Times.Once());
            Mocker.GetMock<IDiskProvider>().Verify(v => v.GetFiles(It.IsAny<string>(), true), Times.Never());
            ExceptionVerification.ExpectedWarns(1);
        }
    }
}
