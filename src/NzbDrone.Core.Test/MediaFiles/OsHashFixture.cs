using System.IO;
using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.MediaFiles;

namespace NzbDrone.Core.Test.MediaFiles
{
    [TestFixture]
    public class OsHashFixture
    {
        [Test]
        public void should_hash_a_file_smaller_than_one_chunk()
        {
            var bytes = new byte[8];
            bytes[0] = 1;

            using var stream = new MemoryStream(bytes);

            OsHash.Compute(stream).Should().Be("0000000000000009");
        }

        [Test]
        public void should_hash_the_head_and_tail_of_a_large_file_once_each()
        {
            var bytes = new byte[OsHash.ChunkSize + 8];
            bytes[OsHash.ChunkSize] = 1;

            using var stream = new MemoryStream(bytes);

            OsHash.Compute(stream).Should().Be("0000000000010009");
        }
    }
}
