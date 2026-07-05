using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.Notifications.Stash;

namespace NzbDrone.Core.Test.NotificationTests.Stash
{
    [TestFixture]
    public class StashPathMapperFixture
    {
        [Test]
        public void should_return_same_path_when_mapping_not_configured()
        {
            var settings = new StashSettings();
            var path = "/data/whisparr/Series/file.mp4";

            StashPathMapper.MapToStashPath(settings, path).Should().Be(path);
            StashPathMapper.MapFromStashPath(settings, path).Should().Be(path);
        }

        [Test]
        public void should_map_whisparr_path_to_stash_path()
        {
            var settings = new StashSettings
            {
                MapFrom = "/data/whisparr",
                MapTo = "/stash/library"
            };

            var whisparrPath = "/data/whisparr/Series/file.mp4";

            StashPathMapper.MapToStashPath(settings, whisparrPath)
                .Should().Be("/stash/library/Series/file.mp4");
        }

        [Test]
        public void should_map_stash_path_to_whisparr_path()
        {
            var settings = new StashSettings
            {
                MapFrom = "/data/whisparr",
                MapTo = "/stash/library"
            };

            var stashPath = "/stash/library/Series/file.mp4";

            StashPathMapper.MapFromStashPath(settings, stashPath)
                .Should().Be("/data/whisparr/Series/file.mp4");
        }

        [Test]
        public void should_not_map_path_outside_configured_prefix()
        {
            var settings = new StashSettings
            {
                MapFrom = "/data/whisparr",
                MapTo = "/stash/library"
            };

            var externalPath = "/data/other/file.mp4";

            StashPathMapper.MapToStashPath(settings, externalPath).Should().Be(externalPath);
            StashPathMapper.MapFromStashPath(settings, externalPath).Should().Be(externalPath);
        }
    }
}
