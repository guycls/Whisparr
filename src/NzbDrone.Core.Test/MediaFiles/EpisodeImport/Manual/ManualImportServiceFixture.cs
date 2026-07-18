using System;
using System.Collections.Generic;
using System.IO;
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
using NzbDrone.Core.MediaFiles.Events;
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

        [Test]
        public void should_import_mixed_in_library_and_external_files_with_separate_new_download_flags()
        {
            var series = Builder<Series>.CreateNew()
                                        .With(s => s.Id = 5)
                                        .With(s => s.Path = @"C:\Series".AsOsAgnostic())
                                        .Build();

            var inLibraryEpisode = Builder<Episode>.CreateNew()
                                                   .With(e => e.Id = 1)
                                                   .With(e => e.SeriesId = 5)
                                                   .Build();

            var externalEpisode = Builder<Episode>.CreateNew()
                                                  .With(e => e.Id = 2)
                                                  .With(e => e.SeriesId = 5)
                                                  .Build();

            var inLibraryPath = Path.Combine(series.Path, "in-library.mp4").AsOsAgnostic();
            var externalPath = @"C:\External\external.mp4".AsOsAgnostic();

            SetupManualImportMocks(series, inLibraryEpisode, externalEpisode);

            var importCalls = new List<bool>();

            Mocker.GetMock<IImportApprovedEpisodes>()
                  .Setup(s => s.Import(It.IsAny<List<ImportDecision>>(), It.IsAny<bool>(), null, ImportMode.Auto))
                  .Callback<List<ImportDecision>, bool, DownloadClientItem, ImportMode>((_, newDownload, _, _) => importCalls.Add(newDownload))
                  .Returns(new List<ImportResult>());

            var command = new ManualImportCommand
            {
                ImportMode = ImportMode.Auto,
                Files = new List<ManualImportFile>
                {
                    new ManualImportFile
                    {
                        Path = inLibraryPath,
                        SeriesId = 5,
                        EpisodeIds = new List<int> { inLibraryEpisode.Id },
                        Quality = new QualityModel(Quality.HDTV720p),
                        Languages = new List<Language> { Language.English }
                    },
                    new ManualImportFile
                    {
                        Path = externalPath,
                        SeriesId = 5,
                        EpisodeIds = new List<int> { externalEpisode.Id },
                        Quality = new QualityModel(Quality.HDTV720p),
                        Languages = new List<Language> { Language.English }
                    }
                }
            };

            Subject.Execute(command);

            importCalls.Should().BeEquivalentTo(new[] { false, true });
            Mocker.GetMock<IImportApprovedEpisodes>()
                  .Verify(v => v.Import(It.IsAny<List<ImportDecision>>(), It.IsAny<bool>(), null, ImportMode.Auto), Times.Exactly(2));
        }

        [Test]
        public void should_not_throw_when_all_untracked_imports_fail()
        {
            var series = Builder<Series>.CreateNew()
                                        .With(s => s.Id = 5)
                                        .With(s => s.Path = @"C:\Series".AsOsAgnostic())
                                        .Build();

            var episode = Builder<Episode>.CreateNew()
                                          .With(e => e.Id = 1)
                                          .With(e => e.SeriesId = 5)
                                          .Build();

            SetupManualImportMocks(series, episode);

            var localEpisode = new LocalEpisode
            {
                Path = @"C:\External\external.mp4".AsOsAgnostic(),
                Series = series,
                Episodes = new List<Episode> { episode },
                Quality = new QualityModel(Quality.HDTV720p),
                Languages = new List<Language> { Language.English }
            };

            Mocker.GetMock<IImportApprovedEpisodes>()
                  .Setup(s => s.Import(It.IsAny<List<ImportDecision>>(), true, null, ImportMode.Auto))
                  .Returns(new List<ImportResult> { new ImportResult(new ImportDecision(localEpisode), "Failed to import episode") });

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
                        Quality = localEpisode.Quality,
                        Languages = localEpisode.Languages
                    }
                }
            };

            Action act = () => Subject.Execute(command);

            act.Should().NotThrow();
            Mocker.GetMock<IEventAggregator>()
                  .Verify(v => v.PublishEvent(It.IsAny<UntrackedDownloadCompletedEvent>()), Times.Never());
        }

        private void SetupManualImportMocks(Series series, params Episode[] episodes)
        {
            Mocker.GetMock<ISeriesService>()
                  .Setup(s => s.GetSeries(series.Id))
                  .Returns(series);

            Mocker.GetMock<IEpisodeService>()
                  .Setup(s => s.GetEpisodes(It.IsAny<IEnumerable<int>>()))
                  .Returns((IEnumerable<int> ids) =>
                  {
                      var idList = new List<int>(ids);
                      return new List<Episode>(Array.FindAll(episodes, e => idList.Contains(e.Id)));
                  });

            Mocker.GetMock<IAggregationService>()
                  .Setup(s => s.Augment(It.IsAny<LocalEpisode>(), It.IsAny<DownloadClientItem>()))
                  .Returns<LocalEpisode, DownloadClientItem>((local, item) => local);

            Mocker.GetMock<ICustomFormatCalculationService>()
                  .Setup(s => s.ParseCustomFormat(It.IsAny<LocalEpisode>()))
                  .Returns(new List<CustomFormat>());
        }
    }
}
