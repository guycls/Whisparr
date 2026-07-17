using System.Collections.Generic;
using FizzWare.NBuilder;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Common.Disk;
using NzbDrone.Core.CustomFormats;
using NzbDrone.Core.Download;
using NzbDrone.Core.Download.TrackedDownloads;
using NzbDrone.Core.Languages;
using NzbDrone.Core.MediaFiles;
using NzbDrone.Core.MediaFiles.EpisodeImport;
using NzbDrone.Core.MediaFiles.EpisodeImport.Aggregation;
using NzbDrone.Core.MediaFiles.EpisodeImport.Manual;
using NzbDrone.Core.Messaging.Events;
using NzbDrone.Core.Parser.Model;
using NzbDrone.Core.Qualities;
using NzbDrone.Core.Test.Framework;
using NzbDrone.Core.Tv;
using NzbDrone.Test.Common;

namespace NzbDrone.Core.Test.MediaFiles.EpisodeImport.Manual
{
    [TestFixture]
    public class ManualImportServiceFixture : CoreTest<ManualImportService>
    {
        private const string DownloadId = "51BB4A283478B29E3281C22C251A0A21D53E4D6A";

        [Test]
        public void should_update_current_cache_entry_after_tracked_download_replacement()
        {
            var series = Builder<Series>.CreateNew()
                                        .With(s => s.Id = 5)
                                        .With(s => s.Path = @"C:\Series".AsOsAgnostic())
                                        .Build();

            var episode = Builder<Episode>.CreateNew()
                                          .With(e => e.Id = 16158)
                                          .With(e => e.SeriesId = 5)
                                          .Build();

            var downloadItem = Builder<DownloadClientItem>.CreateNew()
                                                          .With(d => d.DownloadId = DownloadId)
                                                          .With(d => d.OutputPath = new OsPath(@"C:\Downloads\Release".AsOsAgnostic()))
                                                          .With(d => d.CanMoveFiles = false)
                                                          .Build();

            var staleTrackedDownload = Builder<TrackedDownload>.CreateNew()
                                                               .With(t => t.DownloadItem = downloadItem)
                                                               .With(t => t.State = TrackedDownloadState.ImportPending)
                                                               .With(t => t.RemoteEpisode = (RemoteEpisode)null)
                                                               .Build();

            var currentTrackedDownload = Builder<TrackedDownload>.CreateNew()
                                                                 .With(t => t.DownloadItem = downloadItem)
                                                                 .With(t => t.State = TrackedDownloadState.ImportPending)
                                                                 .With(t => t.RemoteEpisode = (RemoteEpisode)null)
                                                                 .Build();

            var episodeFile = Builder<EpisodeFile>.CreateNew()
                                                  .With(f => f.Id = 445)
                                                  .Build();

            var localEpisode = new LocalEpisode
            {
                Path = @"C:\Downloads\Release\video.mp4".AsOsAgnostic(),
                Series = series,
                Episodes = new List<Episode> { episode },
                Quality = new QualityModel(Quality.HDTV720p),
                Languages = new List<Language> { Language.English }
            };

            var importResult = new ImportResult(new ImportDecision(localEpisode), episodeFile);

            Mocker.GetMock<ISeriesService>()
                  .Setup(s => s.GetSeries(5))
                  .Returns(series);

            Mocker.GetMock<IEpisodeService>()
                  .Setup(s => s.GetEpisodes(It.IsAny<IEnumerable<int>>()))
                  .Returns(new List<Episode> { episode });

            Mocker.GetMock<ITrackedDownloadService>()
                  .SetupSequence(s => s.Find(DownloadId))
                  .Returns(staleTrackedDownload)
                  .Returns(currentTrackedDownload);

            Mocker.GetMock<IAggregationService>()
                  .Setup(s => s.Augment(It.IsAny<LocalEpisode>(), It.IsAny<DownloadClientItem>()))
                  .Returns<LocalEpisode, DownloadClientItem>((local, item) => local);

            Mocker.GetMock<ICustomFormatCalculationService>()
                  .Setup(s => s.ParseCustomFormat(It.IsAny<LocalEpisode>()))
                  .Returns(new List<CustomFormat>());

            Mocker.GetMock<IImportApprovedEpisodes>()
                  .Setup(s => s.Import(It.IsAny<List<ImportDecision>>(), true, downloadItem, ImportMode.Auto))
                  .Returns(new List<ImportResult> { importResult });

            Mocker.GetMock<IDiskProvider>()
                  .Setup(s => s.FolderExists(It.IsAny<string>()))
                  .Returns(false);

            var command = new ManualImportCommand
            {
                ImportMode = ImportMode.Auto,
                Files = new List<ManualImportFile>
                {
                    new ManualImportFile
                    {
                        Path = localEpisode.Path,
                        SeriesId = 5,
                        EpisodeIds = new List<int> { episode.Id },
                        DownloadId = DownloadId,
                        Quality = localEpisode.Quality,
                        Languages = localEpisode.Languages
                    }
                }
            };

            Subject.Execute(command);

            staleTrackedDownload.State.Should().Be(TrackedDownloadState.ImportPending);
            currentTrackedDownload.State.Should().Be(TrackedDownloadState.Imported);

            Mocker.GetMock<IEventAggregator>()
                  .Verify(v => v.PublishEvent(It.Is<DownloadCompletedEvent>(e => e.TrackedDownload == currentTrackedDownload)), Times.Once());
        }
    }
}
