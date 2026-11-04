using System;
using System.IO;
using System.Text.RegularExpressions;
using NzbDrone.Common.Extensions;

namespace NzbDrone.Core.Notifications.Stash
{
    public static class StashPreviewPath
    {
        private static readonly Regex OsHashPattern = new Regex("^[0-9a-fA-F]{16}$", RegexOptions.Compiled);

        public static string Build(string generatedFolder, string osHash)
        {
            if (generatedFolder.IsNullOrWhiteSpace() || osHash.IsNullOrWhiteSpace() || !OsHashPattern.IsMatch(osHash))
            {
                return null;
            }

            var root = Path.GetFullPath(generatedFolder);
            var preview = Path.GetFullPath(Path.Combine(root, "screenshots", osHash.ToLowerInvariant() + ".mp4"));
            var rootPrefix = root.TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar) + Path.DirectorySeparatorChar;

            if (!preview.StartsWith(rootPrefix, StringComparison.OrdinalIgnoreCase))
            {
                return null;
            }

            return preview;
        }
    }
}
