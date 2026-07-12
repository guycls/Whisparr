using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.Parser;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.ParserTests
{
    [TestFixture]
    public class FilePartParserFixture : CoreTest
    {
        [TestCase("Sophia Locke - Punished Step Mom Part 1.mp4", 1, null)]
        [TestCase("Sophia Locke - Punished Step Mom Part 2.mp4", 2, null)]
        [TestCase("Sophia Locke - Punished Step Mom Part 3.mp4", 3, null)]
        [TestCase("Scene Title Pt. 1 of 3.mkv", 1, 3)]
        [TestCase("Scene Title Part 2 of 3.mkv", 2, 3)]
        [TestCase("[01/03] - MIDA-422.mp4", 1, 3)]
        [TestCase("[02+10] - MIDA-433.mp4", 2, 10)]
        [TestCase("Some.Scene.Title.cd1.avi", 1, null)]
        [TestCase("Some.Scene.Title.cd2.avi", 2, null)]
        [TestCase("MIAA-262.1.2.mp4", 2, null)]
        [TestCase("Bare Back Studios - Scene Title.mp4", null, null)]
        public void should_parse_file_part(string fileName, int? partNumber, int? partTotal)
        {
            var result = FilePartParser.Parse(fileName);

            result.PartNumber.Should().Be(partNumber);
            result.PartTotal.Should().Be(partTotal);
            result.IsSplitPart.Should().Be(partNumber.HasValue);
        }
    }
}
