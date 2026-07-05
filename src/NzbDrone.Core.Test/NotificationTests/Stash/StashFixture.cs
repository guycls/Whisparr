using System.Collections.Generic;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.MediaFiles;
using NzbDrone.Core.Notifications;
using NzbDrone.Core.Notifications.Stash;
using NzbDrone.Core.Test.Framework;
using NzbDrone.Core.Tv;
using NzbDrone.Test.Common;

namespace NzbDrone.Core.Test.NotificationTests.Stash
{
    [TestFixture]
    public class StashFixture : CoreTest<NzbDrone.Core.Notifications.Stash.Stash>
    {
        private StashSettings _settings;

        [SetUp]
        public void Setup()
        {
            _settings = new StashSettings();

            Subject.Definition = new NotificationDefinition
            {
                Settings = _settings
            };
        }

        [Test]
        public void on_download_should_update_with_episode_file_path()
        {
            var message = new DownloadMessage
            {
                Series = new Series { Path = @"C:\Test\Studio".AsOsAgnostic() },
                EpisodeFile = new EpisodeFile { Path = @"C:\Test\Studio\scene.mp4".AsOsAgnostic() }
            };

            Subject.OnDownload(message);

            Mocker.GetMock<IStashService>()
                .Verify(s => s.Update(_settings, message.EpisodeFile.Path), Times.Once);
        }

        [Test]
        public void on_download_should_fallback_to_source_path()
        {
            var sourcePath = @"C:\Test\Studio\scene.mp4".AsOsAgnostic();
            var message = new DownloadMessage
            {
                Series = new Series { Path = @"C:\Test\Studio".AsOsAgnostic() },
                SourcePath = sourcePath
            };

            Subject.OnDownload(message);

            Mocker.GetMock<IStashService>()
                .Verify(s => s.Update(_settings, sourcePath), Times.Once);
        }

        [Test]
        public void on_rename_should_update_each_renamed_file()
        {
            var path1 = @"C:\Test\Studio\scene1.mp4".AsOsAgnostic();
            var path2 = @"C:\Test\Studio\scene2.mp4".AsOsAgnostic();

            Subject.OnRename(
                new Series(),
                new List<RenamedEpisodeFile>
                {
                    new RenamedEpisodeFile { EpisodeFile = new EpisodeFile { Path = path1 } },
                    new RenamedEpisodeFile { EpisodeFile = new EpisodeFile { Path = path2 } }
                });

            Mocker.GetMock<IStashService>().Verify(s => s.Update(_settings, path1), Times.Once);
            Mocker.GetMock<IStashService>().Verify(s => s.Update(_settings, path2), Times.Once);
        }

        [Test]
        public void on_episode_file_delete_should_update_deleted_file_path()
        {
            var path = @"C:\Test\Studio\scene.mp4".AsOsAgnostic();

            Subject.OnEpisodeFileDelete(new EpisodeDeleteMessage
            {
                EpisodeFile = new EpisodeFile { Path = path }
            });

            Mocker.GetMock<IStashService>()
                .Verify(s => s.Update(_settings, path), Times.Once);
        }
    }
}
