using System.Collections.Generic;
using System.IO;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Common.Disk;
using NzbDrone.Core.MediaFiles;
using NzbDrone.Core.Test.Framework;
using NzbDrone.Core.Tv;

namespace NzbDrone.Core.Test.MediaFiles
{
    [TestFixture]
    public class EpisodeFileOsHashServiceFixture : CoreTest<EpisodeFileOsHashService>
    {
        private Series _series;
        private EpisodeFile _episodeFile;
        private string _path;
        private byte[] _bytes;

        [SetUp]
        public void Setup()
        {
            _bytes = new byte[8];
            _bytes[0] = 1;

            _path = Path.GetTempFileName();
            File.WriteAllBytes(_path, _bytes);

            _series = new Series
            {
                Id = 3,
                Path = Path.GetDirectoryName(_path)
            };

            _episodeFile = new EpisodeFile
            {
                Id = 9,
                SeriesId = _series.Id,
                RelativePath = Path.GetFileName(_path)
            };

            Mocker.GetMock<IMediaFileService>()
                .Setup(s => s.GetFilesBySeries(_series.Id))
                .Returns(new List<EpisodeFile> { _episodeFile });

            Mocker.GetMock<IDiskProvider>()
                .Setup(d => d.FileExists(_path))
                .Returns(true);

            Mocker.GetMock<IDiskProvider>()
                .Setup(d => d.OpenReadStream(_path))
                .Returns(() => File.OpenRead(_path));
        }

        [TearDown]
        public void TearDown()
        {
            if (File.Exists(_path))
            {
                File.Delete(_path);
            }
        }

        [Test]
        public void should_store_hash_once_and_skip_the_file_on_the_second_pass()
        {
            Subject.UpdateMissingHashes(_series);
            Subject.UpdateMissingHashes(_series);

            _episodeFile.OsHash.Should().Be("0000000000000009");
            Mocker.GetMock<IMediaFileService>()
                .Verify(s => s.SetOsHash(It.Is<EpisodeFile>(file => file.OsHash == "0000000000000009")), Times.Once());
            Mocker.GetMock<IDiskProvider>()
                .Verify(d => d.OpenReadStream(_path), Times.Once());
        }

        [Test]
        public void should_not_read_a_file_that_already_has_a_hash()
        {
            _episodeFile.OsHash = "0000000000000009";

            Subject.UpdateMissingHashes(_series);

            Mocker.GetMock<IDiskProvider>()
                .Verify(d => d.OpenReadStream(It.IsAny<string>()), Times.Never());
            Mocker.GetMock<IMediaFileService>()
                .Verify(s => s.SetOsHash(It.IsAny<EpisodeFile>()), Times.Never());
        }
    }
}
