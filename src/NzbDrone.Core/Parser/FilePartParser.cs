using System;
using System.IO;
using System.Text.RegularExpressions;

namespace NzbDrone.Core.Parser
{
    public struct FilePartInfo
    {
        public int? PartNumber { get; set; }
        public int? PartTotal { get; set; }

        public bool IsSplitPart => PartNumber.HasValue;
    }

    public static class FilePartParser
    {
        private static readonly Regex BracketPartRegex = new Regex(@"\[(?<part>\d{1,3})[/+](?<total>\d{1,3})\]", RegexOptions.Compiled | RegexOptions.IgnoreCase);
        private static readonly Regex PartOfRegex = new Regex(@"(?:^|[\s._-])(?:Part|Pt\.?)\s*(?<part>\d{1,3})\s*(?:of\s*(?<total>\d{1,3}))?(?:[\s._-]|$)", RegexOptions.Compiled | RegexOptions.IgnoreCase);
        private static readonly Regex CdRegex = new Regex(@"(?:^|[\s._-])(?:cd|disc)(?<part>\d{1,3})(?:[\s._-]|$)", RegexOptions.Compiled | RegexOptions.IgnoreCase);
        private static readonly Regex JavSegmentRegex = new Regex(@"^(?<base>[A-Z]{2,10}-\d{2,10})(?<segments>(?:\.\d+)+)$", RegexOptions.Compiled | RegexOptions.IgnoreCase);

        public static FilePartInfo Parse(string path)
        {
            if (string.IsNullOrWhiteSpace(path))
            {
                return default;
            }

            var bracketMatch = BracketPartRegex.Match(path);
            if (bracketMatch.Success)
            {
                return new FilePartInfo
                {
                    PartNumber = int.Parse(bracketMatch.Groups["part"].Value),
                    PartTotal = int.Parse(bracketMatch.Groups["total"].Value)
                };
            }

            var fileName = GetFileNameWithoutExtension(path);

            var javMatch = JavSegmentRegex.Match(fileName);
            if (javMatch.Success)
            {
                var segmentParts = javMatch.Groups["segments"].Value.Trim('.').Split('.');
                if (segmentParts.Length > 0 && int.TryParse(segmentParts[^1], out var partNumber))
                {
                    return new FilePartInfo { PartNumber = partNumber };
                }
            }

            var partOfMatch = PartOfRegex.Match(fileName);
            if (partOfMatch.Success)
            {
                var info = new FilePartInfo
                {
                    PartNumber = int.Parse(partOfMatch.Groups["part"].Value)
                };

                if (partOfMatch.Groups["total"].Success)
                {
                    info.PartTotal = int.Parse(partOfMatch.Groups["total"].Value);
                }

                return info;
            }

            var cdMatch = CdRegex.Match(fileName);
            if (cdMatch.Success)
            {
                return new FilePartInfo
                {
                    PartNumber = int.Parse(cdMatch.Groups["part"].Value)
                };
            }

            return default;
        }

        private static string GetFileNameWithoutExtension(string path)
        {
            var lastSeparator = Math.Max(path.LastIndexOf('\\'), path.LastIndexOf('/'));
            var fileName = lastSeparator >= 0 ? path.Substring(lastSeparator + 1) : path;
            var extension = Path.GetExtension(fileName);

            return string.IsNullOrEmpty(extension) ? fileName : fileName.Substring(0, fileName.Length - extension.Length);
        }
    }
}
