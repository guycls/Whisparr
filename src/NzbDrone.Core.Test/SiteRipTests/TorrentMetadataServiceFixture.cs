using System.Collections.Generic;
using System.Linq;
using FluentAssertions;
using MonoTorrent.BEncoding;
using NUnit.Framework;
using NzbDrone.Core.SiteRip;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.SiteRipTests
{
    [TestFixture]
    public class TorrentMetadataServiceFixture : CoreTest<TorrentMetadataService>
    {
        [Test]
        public void should_return_only_video_files()
        {
            var torrentBytes = TestTorrentBuilder.CreateMultiFileTorrent(
                ("site/My Scene Title.mp4", 1000),
                ("site/readme.txt", 100),
                ("site/another.mkv", 2000));

            var results = Subject.GetVideoFilesFromBytes(torrentBytes).GetAwaiter().GetResult();

            results.Should().HaveCount(2);
            results.Should().Contain(f => f.Name == "My Scene Title.mp4");
            results.Should().Contain(f => f.Name == "another.mkv");
            results.Should().NotContain(f => f.Name == "readme.txt");
        }

        [Test]
        public void should_assign_file_indices()
        {
            var torrentBytes = TestTorrentBuilder.CreateMultiFileTorrent(
                ("site/first.mp4", 1000),
                ("site/second.avi", 2000));

            var results = Subject.GetVideoFilesFromBytes(torrentBytes).GetAwaiter().GetResult();

            results.Should().HaveCount(2);
            results[0].Index.Should().Be(0);
            results[1].Index.Should().Be(1);
        }
    }

    internal static class TestTorrentBuilder
    {
        public static byte[] CreateMultiFileTorrent(params (string path, long size)[] files)
        {
            var fileList = new BEncodedList();

            foreach (var file in files)
            {
                var pathParts = file.path.Split('/').Select(part => (BEncodedString)part).ToArray();

                fileList.Add(new BEncodedDictionary
                {
                    { "length", (BEncodedNumber)file.size },
                    { "path", new BEncodedList(pathParts) }
                });
            }

            var info = new BEncodedDictionary
            {
                { "name", (BEncodedString)"testpack" },
                { "piece length", (BEncodedNumber)16384 },
                { "pieces", (BEncodedString)new byte[20] },
                { "files", fileList }
            };

            var meta = new BEncodedDictionary
            {
                { "announce", (BEncodedString)"http://example.com/announce" },
                { "info", info }
            };

            return meta.Encode();
        }
    }
}
