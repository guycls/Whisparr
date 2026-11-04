using System;
using System.Buffers.Binary;
using System.IO;

namespace NzbDrone.Core.MediaFiles
{
    public static class OsHash
    {
        public const int ChunkSize = 64 * 1024;

        public static string Compute(Stream stream)
        {
            if (stream == null)
            {
                throw new ArgumentNullException(nameof(stream));
            }

            if (!stream.CanSeek)
            {
                throw new ArgumentException("Stream must be seekable", nameof(stream));
            }

            var size = stream.Length;
            var hash = (ulong)size;

            if (size < ChunkSize)
            {
                var buffer = new byte[size];

                if (!TryReadExact(stream, buffer, (int)size))
                {
                    return null;
                }

                hash += Sum(buffer);
            }
            else
            {
                var buffer = new byte[ChunkSize];

                if (!TryReadExact(stream, buffer, ChunkSize))
                {
                    return null;
                }

                hash += Sum(buffer);

                stream.Seek(-ChunkSize, SeekOrigin.End);

                if (!TryReadExact(stream, buffer, ChunkSize))
                {
                    return null;
                }

                hash += Sum(buffer);
            }

            return hash.ToString("x16");
        }

        private static ulong Sum(byte[] buffer)
        {
            ulong sum = 0;

            for (var i = 0; i + 8 <= buffer.Length; i += 8)
            {
                sum += BinaryPrimitives.ReadUInt64LittleEndian(buffer.AsSpan(i, 8));
            }

            return sum;
        }

        private static bool TryReadExact(Stream stream, byte[] buffer, int count)
        {
            var offset = 0;

            while (offset < count)
            {
                var read = stream.Read(buffer, offset, count - offset);

                if (read == 0)
                {
                    return false;
                }

                offset += read;
            }

            return true;
        }
    }
}
