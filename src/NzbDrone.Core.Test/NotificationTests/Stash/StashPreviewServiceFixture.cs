using System.Collections.Generic;
using System.IO;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Common.Disk;
using NzbDrone.Core.MediaFiles;
using NzbDrone.Core.Notifications;
using NzbDrone.Core.Notifications.Stash;
using NzbDrone.Core.Test.Framework;
using NzbDrone.Core.Tv;

namespace NzbDrone.Core.Test.NotificationTests.Stash
{
    [TestFixture]
    public class StashPreviewPathFixture
    {
        [Test]
        public void should_build_the_screenshots_path_from_the_os_hash()
        {
            var folder = Path.Combine(Path.GetTempPath(), "stash-generated");
            var expected = Path.GetFullPath(Path.Combine(folder, "screenshots", "e01f4b1fc6dcc025.mp4"));

            StashPreviewPath.Build(folder, "E01F4B1FC6DCC025").Should().Be(expected);
        }

        [Test]
        public void should_reject_a_hash_that_is_not_hex()
        {
            StashPreviewPath.Build(Path.GetTempPath(), "../secret").Should().BeNull();
        }
    }

    [TestFixture]
    public class StashPreviewServiceFixture : CoreTest<StashPreviewService>
    {
        private StashSettings _settings;
        private string _folder;
        private string _previewPath;

        [SetUp]
        public void Setup()
        {
            _folder = Path.Combine(Path.GetTempPath(), "stash-generated");
            _previewPath = StashPreviewPath.Build(_folder, "e01f4b1fc6dcc025");
            _settings = new StashSettings
            {
                Host = "localhost",
                Port = 9999,
                GeneratedFolder = _folder
            };

            Mocker.GetMock<INotificationFactory>()
                .Setup(f => f.All())
                .Returns(new List<NotificationDefinition>
                {
                    new NotificationDefinition
                    {
                        Implementation = "Stash",
                        Settings = _settings
                    }
                });

            Mocker.GetMock<IEpisodeService>()
                .Setup(s => s.FindEpisodes(It.IsAny<IEnumerable<int>>()))
                .Returns(new List<Episode>
                {
                    new Episode
                    {
                        Id = 4,
                        EpisodeFileId = 8
                    }
                });

            Mocker.GetMock<IMediaFileService>()
                .Setup(s => s.Find(8))
                .Returns(new EpisodeFile
                {
                    Id = 8,
                    OsHash = "e01f4b1fc6dcc025"
                });
        }

        [Test]
        public void should_return_the_preview_when_the_file_exists()
        {
            Mocker.GetMock<IDiskProvider>()
                .Setup(d => d.FileExists(_previewPath))
                .Returns(true);

            Subject.GetPreviewPath(4).Should().Be(_previewPath);
        }

        [Test]
        public void should_return_null_when_the_generated_folder_is_unset()
        {
            _settings.GeneratedFolder = null;

            Subject.GetPreviewPath(4).Should().BeNull();
        }

        [Test]
        public void should_return_null_when_the_hash_is_missing()
        {
            Mocker.GetMock<IMediaFileService>()
                .Setup(s => s.Find(8))
                .Returns(new EpisodeFile { Id = 8 });

            Subject.GetPreviewPath(4).Should().BeNull();
            Mocker.GetMock<IDiskProvider>()
                .Verify(d => d.FileExists(It.IsAny<string>()), Times.Never());
        }

        [Test]
        public void should_return_null_when_the_preview_file_is_missing()
        {
            Mocker.GetMock<IDiskProvider>()
                .Setup(d => d.FileExists(_previewPath))
                .Returns(false);

            Subject.GetPreviewPath(4).Should().BeNull();
        }

        [Test]
        public void should_return_null_when_stash_is_not_configured()
        {
            Mocker.GetMock<INotificationFactory>()
                .Setup(f => f.All())
                .Returns(new List<NotificationDefinition>());

            Subject.GetPreviewPath(4).Should().BeNull();
        }
    }
}
