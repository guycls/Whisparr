using System;
using System.Collections.Generic;
using System.Linq;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.CustomFormats;
using NzbDrone.Core.Download;
using NzbDrone.Core.Download.History;
using NzbDrone.Core.Download.TrackedDownloads;
using NzbDrone.Core.History;
using NzbDrone.Core.Indexers;
using NzbDrone.Core.IndexerSearch.Definitions;
using NzbDrone.Core.Parser;
using NzbDrone.Core.Parser.Model;
using NzbDrone.Core.SiteRip;
using NzbDrone.Core.Test.Framework;
using NzbDrone.Core.Tv;
using NzbDrone.Core.Tv.Events;

namespace NzbDrone.Core.Test.Download.TrackedDownloads
{
    [TestFixture]
    public class TrackedDownloadServiceFixture : CoreTest<TrackedDownloadService>
    {
        private void GivenDownloadHistory()
        {
            Mocker.GetMock<IHistoryService>()
                .Setup(s => s.FindByDownloadId(It.Is<string>(sr => sr == "35238")))
                .Returns(new List<EpisodeHistory>()
                {
                 new EpisodeHistory()
                {
                     DownloadId = "35238",
                     SourceTitle = "TV Series 23.02.01",
                     SeriesId = 5,
                     EpisodeId = 4
                }
                });
        }

        [Test]
        public void should_track_downloads_using_the_source_title_if_it_cannot_be_found_using_the_download_title()
        {
            GivenDownloadHistory();

            var remoteEpisode = new RemoteEpisode
            {
                Series = new Series() { Id = 5 },
                Episodes = new List<Episode> { new Episode { Id = 4 } },
                ParsedEpisodeInfo = new ParsedEpisodeInfo()
                {
                    SeriesTitle = "TV Series",
                    AirDate = "2023-02-01"
                }
            };

            Mocker.GetMock<IParsingService>()
                  .Setup(s => s.Map(It.Is<ParsedEpisodeInfo>(i => i.SeriesTitle == "TV Series"), It.IsAny<int>(), It.IsAny<IEnumerable<int>>()))
                  .Returns(remoteEpisode);

            var client = new DownloadClientDefinition()
            {
                Id = 1,
                Protocol = DownloadProtocol.Torrent
            };

            var item = new DownloadClientItem()
            {
                Title = "The torrent release folder",
                DownloadId = "35238",
                DownloadClientInfo = new DownloadClientItemClientInfo
                {
                    Protocol = client.Protocol,
                    Id = client.Id,
                    Name = client.Name
                }
            };

            var trackedDownload = Subject.TrackDownload(client, item);

            trackedDownload.Should().NotBeNull();
            trackedDownload.RemoteEpisode.Should().NotBeNull();
            trackedDownload.RemoteEpisode.Series.Should().NotBeNull();
            trackedDownload.RemoteEpisode.Series.Id.Should().Be(5);
            trackedDownload.RemoteEpisode.Episodes.First().Id.Should().Be(4);
        }

        [Test]
        public void should_parse_as_special_when_source_title_parsing_fails()
        {
            var remoteEpisode = new RemoteEpisode
            {
                Series = new Series() { Id = 5 },
                Episodes = new List<Episode> { new Episode { Id = 4 } },
                ParsedEpisodeInfo = new ParsedEpisodeInfo()
                {
                    SeriesTitle = "TV Series"
                }
            };

            Mocker.GetMock<IHistoryService>()
                .Setup(s => s.FindByDownloadId(It.Is<string>(sr => sr == "35238")))
                .Returns(new List<EpisodeHistory>()
                {
                 new EpisodeHistory()
                {
                     DownloadId = "35238",
                     SourceTitle = "TV Series Special",
                     SeriesId = 5,
                     EpisodeId = 4
                }
                });

            Mocker.GetMock<IParsingService>()
                  .Setup(s => s.Map(It.Is<ParsedEpisodeInfo>(i => i.SeriesTitle == "TV Series"), It.IsAny<int>(), It.IsAny<IEnumerable<int>>()))
                  .Returns(remoteEpisode);

            Mocker.GetMock<IParsingService>()
                  .Setup(s => s.ParseSpecialEpisodeTitle(It.IsAny<ParsedEpisodeInfo>(), It.IsAny<string>(), It.IsAny<int>(), null))
                  .Returns(remoteEpisode.ParsedEpisodeInfo);

            var client = new DownloadClientDefinition()
            {
                Id = 1,
                Protocol = DownloadProtocol.Torrent
            };

            var item = new DownloadClientItem()
            {
                Title = "The torrent release folder",
                DownloadId = "35238",
                DownloadClientInfo = new DownloadClientItemClientInfo
                {
                    Protocol = client.Protocol,
                    Id = client.Id,
                    Name = client.Name
                }
            };

            var trackedDownload = Subject.TrackDownload(client, item);

            trackedDownload.Should().NotBeNull();
            trackedDownload.RemoteEpisode.Should().NotBeNull();
            trackedDownload.RemoteEpisode.Series.Should().NotBeNull();
            trackedDownload.RemoteEpisode.Series.Id.Should().Be(5);
            trackedDownload.RemoteEpisode.Episodes.First().Id.Should().Be(4);
        }

        [Test]
        public void should_unmap_tracked_download_if_episode_deleted()
        {
            GivenDownloadHistory();

            var remoteEpisode = new RemoteEpisode
                                {
                                    Series = new Series() { Id = 5 },
                                    Episodes = new List<Episode> { new Episode { Id = 4 } },
                                    ParsedEpisodeInfo = new ParsedEpisodeInfo()
                                                        {
                                                            SeriesTitle = "TV Series"
                                                        }
                                };

            Mocker.GetMock<IParsingService>()
                  .Setup(s => s.Map(It.IsAny<ParsedEpisodeInfo>(), It.IsAny<int>(), (SearchCriteriaBase)null))
                  .Returns(remoteEpisode);

            Mocker.GetMock<IHistoryService>()
                  .Setup(s => s.FindByDownloadId(It.IsAny<string>()))
                  .Returns(new List<EpisodeHistory>());

            var client = new DownloadClientDefinition()
            {
                Id = 1,
                Protocol = DownloadProtocol.Torrent
            };

            var item = new DownloadClientItem()
            {
                Title = "TV Series - S01E01",
                DownloadId = "12345",
                DownloadClientInfo = new DownloadClientItemClientInfo
                                     {
                                         Id = 1,
                                         Type = "Blackhole",
                                         Name = "Blackhole Client",
                                         Protocol = DownloadProtocol.Torrent
                                     }
            };

            Subject.TrackDownload(client, item);
            Subject.GetTrackedDownloads().Should().HaveCount(1);

            Mocker.GetMock<IParsingService>()
                  .Setup(s => s.Map(It.IsAny<ParsedEpisodeInfo>(), It.IsAny<int>(), (SearchCriteriaBase)null))
                  .Returns(default(RemoteEpisode));

            Subject.Handle(new EpisodeInfoRefreshedEvent(remoteEpisode.Series, new List<Episode>(), new List<Episode>(), remoteEpisode.Episodes));

            var trackedDownloads = Subject.GetTrackedDownloads();
            trackedDownloads.Should().HaveCount(1);
            trackedDownloads.First().RemoteEpisode.Should().BeNull();
        }

        [Test]
        public void should_not_throw_when_processing_deleted_episodes()
        {
            GivenDownloadHistory();

            var remoteEpisode = new RemoteEpisode
            {
                Series = new Series() { Id = 5 },
                Episodes = new List<Episode> { new Episode { Id = 4 } },
                ParsedEpisodeInfo = new ParsedEpisodeInfo()
                {
                    SeriesTitle = "TV Series"
                }
            };

            Mocker.GetMock<IParsingService>()
                  .Setup(s => s.Map(It.IsAny<ParsedEpisodeInfo>(), It.IsAny<int>(), (SearchCriteriaBase)null))
                  .Returns(default(RemoteEpisode));

            Mocker.GetMock<IHistoryService>()
                  .Setup(s => s.FindByDownloadId(It.IsAny<string>()))
                  .Returns(new List<EpisodeHistory>());

            var client = new DownloadClientDefinition()
            {
                Id = 1,
                Protocol = DownloadProtocol.Torrent
            };

            var item = new DownloadClientItem()
            {
                Title = "TV Series - S01E01",
                DownloadId = "12345",
                DownloadClientInfo = new DownloadClientItemClientInfo
                {
                    Id = 1,
                    Type = "Blackhole",
                    Name = "Blackhole Client",
                    Protocol = DownloadProtocol.Torrent
                }
            };

            Subject.TrackDownload(client, item);
            Subject.GetTrackedDownloads().Should().HaveCount(1);

            Mocker.GetMock<IParsingService>()
                  .Setup(s => s.Map(It.IsAny<ParsedEpisodeInfo>(), It.IsAny<int>(), (SearchCriteriaBase)null))
                  .Returns(default(RemoteEpisode));

            Subject.Handle(new EpisodeInfoRefreshedEvent(remoteEpisode.Series, new List<Episode>(), new List<Episode>(), remoteEpisode.Episodes));

            var trackedDownloads = Subject.GetTrackedDownloads();
            trackedDownloads.Should().HaveCount(1);
            trackedDownloads.First().RemoteEpisode.Should().BeNull();
        }

        [Test]
        public void should_not_throw_when_processing_deleted_series()
        {
            GivenDownloadHistory();

            var remoteEpisode = new RemoteEpisode
            {
                Series = new Series() { Id = 5 },
                Episodes = new List<Episode> { new Episode { Id = 4 } },
                ParsedEpisodeInfo = new ParsedEpisodeInfo()
                {
                    SeriesTitle = "TV Series"
                }
            };

            Mocker.GetMock<IParsingService>()
                  .Setup(s => s.Map(It.IsAny<ParsedEpisodeInfo>(), It.IsAny<int>(), (SearchCriteriaBase)null))
                  .Returns(default(RemoteEpisode));

            Mocker.GetMock<IHistoryService>()
                  .Setup(s => s.FindByDownloadId(It.IsAny<string>()))
                  .Returns(new List<EpisodeHistory>());

            var client = new DownloadClientDefinition()
            {
                Id = 1,
                Protocol = DownloadProtocol.Torrent
            };

            var item = new DownloadClientItem()
            {
                Title = "TV Series - S01E01",
                DownloadId = "12345",
                DownloadClientInfo = new DownloadClientItemClientInfo
                {
                    Id = 1,
                    Type = "Blackhole",
                    Name = "Blackhole Client",
                    Protocol = DownloadProtocol.Torrent
                }
            };

            Subject.TrackDownload(client, item);
            Subject.GetTrackedDownloads().Should().HaveCount(1);

            Mocker.GetMock<IParsingService>()
                  .Setup(s => s.Map(It.IsAny<ParsedEpisodeInfo>(), It.IsAny<int>(), (SearchCriteriaBase)null))
                  .Returns(default(RemoteEpisode));

            Subject.Handle(new SeriesDeletedEvent(new List<Series> { remoteEpisode.Series }, true, true));

            var trackedDownloads = Subject.GetTrackedDownloads();
            trackedDownloads.Should().HaveCount(1);
            trackedDownloads.First().RemoteEpisode.Should().BeNull();
        }

        [Test]
        public void should_build_remote_episode_from_grab_history_for_interactive_search_grab_when_title_unparseable()
        {
            const string downloadId = "60F906260C523946645C95610D80EDC33786F815";
            const int seriesId = 14;
            const int episodeId = 15101;

            var client = new DownloadClientDefinition
            {
                Id = 1,
                Protocol = DownloadProtocol.Torrent
            };

            var item = new DownloadClientItem
            {
                Title = "[Clips4Sale.com] Cory Chase - Son Cums of Age 1080p.mp4",
                DownloadId = downloadId,
                DownloadClientInfo = new DownloadClientItemClientInfo
                {
                    Protocol = client.Protocol,
                    Id = client.Id,
                    Name = "qBittorrent"
                }
            };

            Mocker.GetMock<IHistoryService>()
                  .Setup(s => s.FindByDownloadId(downloadId))
                  .Returns(new List<EpisodeHistory>
                  {
                      new EpisodeHistory
                      {
                          DownloadId = downloadId,
                          SourceTitle = "[Clips4Sale.com] Cory Chase - Son Cums of Age",
                          SeriesId = seriesId,
                          EpisodeId = episodeId,
                          EventType = EpisodeHistoryEventType.Grabbed,
                          Date = DateTime.UtcNow,
                          Data = new Dictionary<string, string>
                          {
                              [HistoryDataKeys.ReleaseSource] = ReleaseSourceType.InteractiveSearch.ToString()
                          }
                      }
                  });

            Mocker.GetMock<IDownloadHistoryService>()
                  .Setup(s => s.GetLatestDownloadHistoryItem(downloadId))
                  .Returns(new DownloadHistory { EventType = DownloadHistoryEventType.DownloadGrabbed });

            Mocker.GetMock<ISeriesService>()
                  .Setup(s => s.GetSeries(seriesId))
                  .Returns(new Series { Id = seriesId, Title = "Bare Back Studios" });

            Mocker.GetMock<IEpisodeService>()
                  .Setup(s => s.GetEpisodes(It.IsAny<IEnumerable<int>>()))
                  .Returns(new List<Episode> { new Episode { Id = episodeId, SeriesId = seriesId } });

            Mocker.GetMock<ICustomFormatCalculationService>()
                  .Setup(s => s.ParseCustomFormat(It.IsAny<RemoteEpisode>(), It.IsAny<long>()))
                  .Returns(new List<CustomFormat>());

            var trackedDownload = Subject.TrackDownload(client, item);

            trackedDownload.RemoteEpisode.Should().NotBeNull();
            trackedDownload.RemoteEpisode.Series.Id.Should().Be(seriesId);
            trackedDownload.RemoteEpisode.Episodes.Single().Id.Should().Be(episodeId);
            trackedDownload.RemoteEpisode.ShouldOverride.Should().BeTrue();
            trackedDownload.RemoteEpisode.ReleaseSource.Should().Be(ReleaseSourceType.InteractiveSearch);
        }

        [Test]
        public void should_retrack_after_siterip_regrab_when_download_already_imported_returns_false()
        {
            const string downloadId = "ABC123";
            const int siteRipDownloadId = 10;

            var client = new DownloadClientDefinition
            {
                Id = 1,
                Protocol = DownloadProtocol.Torrent
            };

            var item = new DownloadClientItem
            {
                Title = "SiteRIP pack torrent",
                DownloadId = downloadId,
                DownloadClientInfo = new DownloadClientItemClientInfo
                {
                    Protocol = client.Protocol,
                    Id = client.Id,
                    Name = "qBittorrent"
                }
            };

            var grabbedHistory = new EpisodeHistory
            {
                DownloadId = downloadId,
                SeriesId = 5,
                EpisodeId = 100,
                EventType = EpisodeHistoryEventType.Grabbed,
                Date = DateTime.UtcNow,
                Data = new Dictionary<string, string> { [HistoryDataKeys.ShouldOverride] = "true" }
            };

            Mocker.GetMock<IHistoryService>()
                  .Setup(s => s.FindByDownloadId(downloadId))
                  .Returns(new List<EpisodeHistory> { grabbedHistory });

            Mocker.GetMock<IDownloadHistoryService>()
                  .Setup(s => s.GetLatestDownloadHistoryItem(downloadId))
                  .Returns(new DownloadHistory { EventType = DownloadHistoryEventType.DownloadImported });

            Mocker.GetMock<ICustomFormatCalculationService>()
                  .Setup(s => s.ParseCustomFormat(It.IsAny<RemoteEpisode>(), It.IsAny<long>()))
                  .Returns(new List<CustomFormat>());

            Subject.TrackDownload(client, item);
            Subject.GetTrackedDownloads().First().State.Should().Be(TrackedDownloadState.Imported);

            Mocker.GetMock<IDownloadHistoryService>()
                  .Setup(s => s.DownloadAlreadyImported(downloadId))
                  .Returns(false);

            Mocker.GetMock<IDownloadHistoryService>()
                  .Setup(s => s.GetLatestDownloadHistoryItem(downloadId))
                  .Returns(new DownloadHistory { EventType = DownloadHistoryEventType.DownloadGrabbed });

            Mocker.GetMock<ISiteRipDownloadRepository>()
                  .Setup(r => r.FindByDownloadId(downloadId))
                  .Returns(new SiteRipDownload
                  {
                      Id = siteRipDownloadId,
                      DownloadId = downloadId,
                      SeriesId = 5
                  });

            Mocker.GetMock<ISiteRipDownloadFileRepository>()
                  .Setup(r => r.GetUnimportedByDownloadId(siteRipDownloadId))
                  .Returns(new List<SiteRipDownloadFile>
                  {
                      new SiteRipDownloadFile { EpisodeId = 100, FileIndex = 1, Imported = false },
                      new SiteRipDownloadFile { EpisodeId = 101, FileIndex = 2, Imported = false }
                  });

            Mocker.GetMock<ISiteRipPendingFileService>()
                  .Setup(s => s.HasPendingFiles(siteRipDownloadId))
                  .Returns(true);

            Mocker.GetMock<ISiteRipPendingFileService>()
                  .Setup(s => s.GetPendingFiles(siteRipDownloadId))
                  .Returns(new List<SiteRipDownloadFile>
                  {
                      new SiteRipDownloadFile { EpisodeId = 100, FileIndex = 1, Imported = false },
                      new SiteRipDownloadFile { EpisodeId = 101, FileIndex = 2, Imported = false }
                  });

            Mocker.GetMock<ISeriesService>()
                  .Setup(s => s.GetSeries(5))
                  .Returns(new Series { Id = 5 });

            Mocker.GetMock<IEpisodeService>()
                  .Setup(s => s.GetEpisodes(It.IsAny<IEnumerable<int>>()))
                  .Returns(new List<Episode>
                  {
                      new Episode { Id = 100, SeriesId = 5 },
                      new Episode { Id = 101, SeriesId = 5 }
                  });

            var trackedDownload = Subject.TrackDownload(client, item);

            trackedDownload.State.Should().Be(TrackedDownloadState.Downloading);
            trackedDownload.RemoteEpisode.Should().NotBeNull();
            trackedDownload.RemoteEpisode.Episodes.Should().HaveCount(2);
            trackedDownload.RemoteEpisode.Episodes.Select(e => e.Id).Should().BeEquivalentTo(new[] { 100, 101 });
        }

        [Test]
        public void should_preserve_imported_state_when_fully_imported_and_no_pending_siterip_files()
        {
            const string downloadId = "DEF456";

            var client = new DownloadClientDefinition
            {
                Id = 1,
                Protocol = DownloadProtocol.Torrent
            };

            var item = new DownloadClientItem
            {
                Title = "SiteRIP pack torrent",
                DownloadId = downloadId,
                DownloadClientInfo = new DownloadClientItemClientInfo
                {
                    Protocol = client.Protocol,
                    Id = client.Id,
                    Name = "qBittorrent"
                }
            };

            Mocker.GetMock<IHistoryService>()
                  .Setup(s => s.FindByDownloadId(It.IsAny<string>()))
                  .Returns(new List<EpisodeHistory>());

            Mocker.GetMock<IDownloadHistoryService>()
                  .Setup(s => s.GetLatestDownloadHistoryItem(It.IsAny<string>()))
                  .Returns(new DownloadHistory { EventType = DownloadHistoryEventType.DownloadImported });

            Mocker.GetMock<IDownloadHistoryService>()
                  .Setup(s => s.DownloadAlreadyImported(It.IsAny<string>()))
                  .Returns(true);

            Mocker.GetMock<ISiteRipDownloadRepository>()
                  .Setup(r => r.FindByDownloadId(It.IsAny<string>()))
                  .Returns((SiteRipDownload)null);

            Mocker.GetMock<IParsingService>()
                  .Setup(s => s.Map(It.IsAny<ParsedEpisodeInfo>(), It.IsAny<int>(), It.IsAny<IEnumerable<int>>()))
                  .Returns(default(RemoteEpisode));

            Mocker.GetMock<ICustomFormatCalculationService>()
                  .Setup(s => s.ParseCustomFormat(It.IsAny<RemoteEpisode>(), It.IsAny<long>()))
                  .Returns(new List<CustomFormat>());

            Subject.TrackDownload(client, item);
            Subject.GetTrackedDownloads().First().State.Should().Be(TrackedDownloadState.Imported);

            var trackedDownload = Subject.TrackDownload(client, item);

            trackedDownload.State.Should().Be(TrackedDownloadState.Imported);
        }

        [Test]
        public void should_preserve_import_pending_when_file_imported_in_download_history()
        {
            const string downloadId = "FILEIMPORTED123";

            var client = new DownloadClientDefinition
            {
                Id = 1,
                Protocol = DownloadProtocol.Torrent
            };

            var item = new DownloadClientItem
            {
                Title = "Unparseable release",
                DownloadId = downloadId,
                DownloadClientInfo = new DownloadClientItemClientInfo
                {
                    Protocol = client.Protocol,
                    Id = client.Id,
                    Name = "qBittorrent"
                }
            };

            Mocker.GetMock<IHistoryService>()
                  .Setup(s => s.FindByDownloadId(It.IsAny<string>()))
                  .Returns(new List<EpisodeHistory>());

            Mocker.GetMock<IDownloadHistoryService>()
                  .Setup(s => s.GetLatestDownloadHistoryItem(It.IsAny<string>()))
                  .Returns(new DownloadHistory { EventType = DownloadHistoryEventType.DownloadGrabbed });

            Mocker.GetMock<IDownloadHistoryService>()
                  .Setup(s => s.DownloadAlreadyImported(It.IsAny<string>()))
                  .Returns(true);

            Mocker.GetMock<ISiteRipDownloadRepository>()
                  .Setup(r => r.FindByDownloadId(It.IsAny<string>()))
                  .Returns((SiteRipDownload)null);

            Mocker.GetMock<ICustomFormatCalculationService>()
                  .Setup(s => s.ParseCustomFormat(It.IsAny<RemoteEpisode>(), It.IsAny<long>()))
                  .Returns(new List<CustomFormat>());

            var trackedDownload = Subject.TrackDownload(client, item);
            trackedDownload.State = TrackedDownloadState.ImportPending;

            Mocker.GetMock<IDownloadHistoryService>()
                  .Setup(s => s.DownloadAlreadyImported(It.IsAny<string>()))
                  .Returns(true);

            var refreshed = Subject.TrackDownload(client, item);

            refreshed.State.Should().Be(TrackedDownloadState.ImportPending);
            refreshed.Should().BeSameAs(trackedDownload);
        }

        [Test]
        public void should_build_siterip_remote_episode_when_site_rip_download_exists_without_should_override()
        {
            const string downloadId = "GHI789";
            const int siteRipDownloadId = 10;

            var client = new DownloadClientDefinition
            {
                Id = 1,
                Protocol = DownloadProtocol.Torrent
            };

            var item = new DownloadClientItem
            {
                Title = "SiteRIP pack torrent",
                DownloadId = downloadId,
                DownloadClientInfo = new DownloadClientItemClientInfo
                {
                    Protocol = client.Protocol,
                    Id = client.Id,
                    Name = "qBittorrent"
                }
            };

            Mocker.GetMock<IHistoryService>()
                  .Setup(s => s.FindByDownloadId(downloadId))
                  .Returns(new List<EpisodeHistory>
                  {
                      new EpisodeHistory
                      {
                          DownloadId = downloadId,
                          SeriesId = 5,
                          EpisodeId = 100,
                          EventType = EpisodeHistoryEventType.Grabbed,
                          Date = DateTime.UtcNow,
                          SourceTitle = "Unparseable SiteRIP pack title 720p",
                          Data = new Dictionary<string, string>()
                      }
                  });

            Mocker.GetMock<IDownloadHistoryService>()
                  .Setup(s => s.GetLatestDownloadHistoryItem(downloadId))
                  .Returns(new DownloadHistory { EventType = DownloadHistoryEventType.DownloadGrabbed });

            Mocker.GetMock<ISiteRipDownloadRepository>()
                  .Setup(r => r.FindByDownloadId(downloadId))
                  .Returns(new SiteRipDownload
                  {
                      Id = siteRipDownloadId,
                      DownloadId = downloadId,
                      SeriesId = 5
                  });

            Mocker.GetMock<ISiteRipDownloadFileRepository>()
                  .Setup(r => r.GetUnimportedByDownloadId(siteRipDownloadId))
                  .Returns(new List<SiteRipDownloadFile>
                  {
                      new SiteRipDownloadFile { EpisodeId = 100, FileIndex = 1, Imported = false },
                      new SiteRipDownloadFile { EpisodeId = 101, FileIndex = 2, Imported = false }
                  });

            Mocker.GetMock<ISiteRipPendingFileService>()
                  .Setup(s => s.HasPendingFiles(siteRipDownloadId))
                  .Returns(true);

            Mocker.GetMock<ISiteRipPendingFileService>()
                  .Setup(s => s.GetPendingFiles(siteRipDownloadId))
                  .Returns(new List<SiteRipDownloadFile>
                  {
                      new SiteRipDownloadFile { EpisodeId = 100, FileIndex = 1, Imported = false },
                      new SiteRipDownloadFile { EpisodeId = 101, FileIndex = 2, Imported = false }
                  });

            Mocker.GetMock<ISeriesService>()
                  .Setup(s => s.GetSeries(5))
                  .Returns(new Series { Id = 5, Title = "Primal" });

            Mocker.GetMock<IEpisodeService>()
                  .Setup(s => s.GetEpisodes(It.IsAny<IEnumerable<int>>()))
                  .Returns(new List<Episode>
                  {
                      new Episode { Id = 100, SeriesId = 5, Title = "Scene A" },
                      new Episode { Id = 101, SeriesId = 5, Title = "Scene B" }
                  });

            Mocker.GetMock<ICustomFormatCalculationService>()
                  .Setup(s => s.ParseCustomFormat(It.IsAny<RemoteEpisode>(), It.IsAny<long>()))
                  .Returns(new List<CustomFormat>());

            var trackedDownload = Subject.TrackDownload(client, item);

            trackedDownload.State.Should().Be(TrackedDownloadState.Downloading);
            trackedDownload.RemoteEpisode.Should().NotBeNull();
            trackedDownload.RemoteEpisode.Series.Id.Should().Be(5);
            trackedDownload.RemoteEpisode.Episodes.Should().HaveCount(2);
            trackedDownload.RemoteEpisode.Episodes.Select(e => e.Id).Should().BeEquivalentTo(new[] { 100, 101 });
            trackedDownload.RemoteEpisode.ReleaseSource.Should().Be(ReleaseSourceType.SiteRip);
        }

        [Test]
        public void should_force_downloading_when_ignored_history_and_pending_siterip_files()
        {
            const string downloadId = "IGNORED123";
            const int siteRipDownloadId = 10;

            var client = new DownloadClientDefinition
            {
                Id = 1,
                Protocol = DownloadProtocol.Torrent
            };

            var item = new DownloadClientItem
            {
                Title = "SiteRIP pack torrent",
                DownloadId = downloadId,
                DownloadClientInfo = new DownloadClientItemClientInfo
                {
                    Protocol = client.Protocol,
                    Id = client.Id,
                    Name = "qBittorrent"
                }
            };

            Mocker.GetMock<IHistoryService>()
                  .Setup(s => s.FindByDownloadId(downloadId))
                  .Returns(new List<EpisodeHistory>
                  {
                      new EpisodeHistory
                      {
                          DownloadId = downloadId,
                          SeriesId = 5,
                          EpisodeId = 100,
                          EventType = EpisodeHistoryEventType.Grabbed,
                          Date = DateTime.UtcNow,
                          Data = new Dictionary<string, string> { [HistoryDataKeys.IsSiteRip] = "true" }
                      }
                  });

            Mocker.GetMock<IDownloadHistoryService>()
                  .Setup(s => s.GetLatestDownloadHistoryItem(downloadId))
                  .Returns(new DownloadHistory { EventType = DownloadHistoryEventType.DownloadIgnored });

            Mocker.GetMock<ISiteRipDownloadRepository>()
                  .Setup(r => r.FindByDownloadId(downloadId))
                  .Returns(new SiteRipDownload
                  {
                      Id = siteRipDownloadId,
                      DownloadId = downloadId,
                      SeriesId = 5
                  });

            Mocker.GetMock<ISiteRipPendingFileService>()
                  .Setup(s => s.HasPendingFiles(siteRipDownloadId))
                  .Returns(true);

            Mocker.GetMock<ISiteRipPendingFileService>()
                  .Setup(s => s.GetPendingFiles(siteRipDownloadId))
                  .Returns(new List<SiteRipDownloadFile>
                  {
                      new SiteRipDownloadFile { EpisodeId = 100, FileIndex = 1, Imported = false }
                  });

            Mocker.GetMock<ISeriesService>()
                  .Setup(s => s.GetSeries(5))
                  .Returns(new Series { Id = 5 });

            Mocker.GetMock<IEpisodeService>()
                  .Setup(s => s.GetEpisodes(It.IsAny<IEnumerable<int>>()))
                  .Returns(new List<Episode> { new Episode { Id = 100, SeriesId = 5 } });

            Mocker.GetMock<ICustomFormatCalculationService>()
                  .Setup(s => s.ParseCustomFormat(It.IsAny<RemoteEpisode>(), It.IsAny<long>()))
                  .Returns(new List<CustomFormat>());

            var trackedDownload = Subject.TrackDownload(client, item);

            trackedDownload.State.Should().Be(TrackedDownloadState.Downloading);
        }

        [Test]
        public void should_force_downloading_when_imported_history_and_pending_siterip_files_on_fresh_track()
        {
            const string downloadId = "IMPORTED123";
            const int siteRipDownloadId = 10;

            var client = new DownloadClientDefinition
            {
                Id = 1,
                Protocol = DownloadProtocol.Torrent
            };

            var item = new DownloadClientItem
            {
                Title = "SiteRIP pack torrent",
                DownloadId = downloadId,
                DownloadClientInfo = new DownloadClientItemClientInfo
                {
                    Protocol = client.Protocol,
                    Id = client.Id,
                    Name = "qBittorrent"
                }
            };

            Mocker.GetMock<IHistoryService>()
                  .Setup(s => s.FindByDownloadId(downloadId))
                  .Returns(new List<EpisodeHistory>
                  {
                      new EpisodeHistory
                      {
                          DownloadId = downloadId,
                          SeriesId = 5,
                          EpisodeId = 100,
                          EventType = EpisodeHistoryEventType.Grabbed,
                          Date = DateTime.UtcNow,
                          Data = new Dictionary<string, string> { [HistoryDataKeys.IsSiteRip] = "true" }
                      }
                  });

            Mocker.GetMock<IDownloadHistoryService>()
                  .Setup(s => s.GetLatestDownloadHistoryItem(downloadId))
                  .Returns(new DownloadHistory { EventType = DownloadHistoryEventType.DownloadImported });

            Mocker.GetMock<ISiteRipDownloadRepository>()
                  .Setup(r => r.FindByDownloadId(downloadId))
                  .Returns(new SiteRipDownload
                  {
                      Id = siteRipDownloadId,
                      DownloadId = downloadId,
                      SeriesId = 5
                  });

            Mocker.GetMock<ISiteRipDownloadFileRepository>()
                  .Setup(r => r.GetUnimportedByDownloadId(siteRipDownloadId))
                  .Returns(new List<SiteRipDownloadFile>
                  {
                      new SiteRipDownloadFile { EpisodeId = 100, FileIndex = 1, Imported = false },
                      new SiteRipDownloadFile { EpisodeId = 101, FileIndex = 2, Imported = false }
                  });

            Mocker.GetMock<ISiteRipPendingFileService>()
                  .Setup(s => s.HasPendingFiles(siteRipDownloadId))
                  .Returns(true);

            Mocker.GetMock<ISiteRipPendingFileService>()
                  .Setup(s => s.GetPendingFiles(siteRipDownloadId))
                  .Returns(new List<SiteRipDownloadFile>
                  {
                      new SiteRipDownloadFile { EpisodeId = 100, FileIndex = 1, Imported = false },
                      new SiteRipDownloadFile { EpisodeId = 101, FileIndex = 2, Imported = false }
                  });

            Mocker.GetMock<ISeriesService>()
                  .Setup(s => s.GetSeries(5))
                  .Returns(new Series { Id = 5 });

            Mocker.GetMock<IEpisodeService>()
                  .Setup(s => s.GetEpisodes(It.IsAny<IEnumerable<int>>()))
                  .Returns(new List<Episode>
                  {
                      new Episode { Id = 100, SeriesId = 5 },
                      new Episode { Id = 101, SeriesId = 5 }
                  });

            Mocker.GetMock<ICustomFormatCalculationService>()
                  .Setup(s => s.ParseCustomFormat(It.IsAny<RemoteEpisode>(), It.IsAny<long>()))
                  .Returns(new List<CustomFormat>());

            var trackedDownload = Subject.TrackDownload(client, item);

            trackedDownload.State.Should().Be(TrackedDownloadState.Downloading);
            trackedDownload.RemoteEpisode.Episodes.Should().HaveCount(2);
        }

        [Test]
        public void should_build_siterip_remote_episode_when_imported_db_rows_but_episode_has_no_file()
        {
            const string downloadId = "STALEIMPORTED";
            const int siteRipDownloadId = 10;

            var client = new DownloadClientDefinition
            {
                Id = 1,
                Protocol = DownloadProtocol.Torrent
            };

            var item = new DownloadClientItem
            {
                Title = "SiteRIP pack torrent",
                DownloadId = downloadId,
                DownloadClientInfo = new DownloadClientItemClientInfo
                {
                    Protocol = client.Protocol,
                    Id = client.Id,
                    Name = "qBittorrent"
                }
            };

            Mocker.GetMock<IHistoryService>()
                  .Setup(s => s.FindByDownloadId(downloadId))
                  .Returns(new List<EpisodeHistory>
                  {
                      new EpisodeHistory
                      {
                          DownloadId = downloadId,
                          SeriesId = 5,
                          EpisodeId = 100,
                          EventType = EpisodeHistoryEventType.Grabbed,
                          Date = DateTime.UtcNow,
                          Data = new Dictionary<string, string> { [HistoryDataKeys.IsSiteRip] = "true" }
                      }
                  });

            Mocker.GetMock<IDownloadHistoryService>()
                  .Setup(s => s.GetLatestDownloadHistoryItem(downloadId))
                  .Returns(new DownloadHistory { EventType = DownloadHistoryEventType.DownloadGrabbed });

            Mocker.GetMock<ISiteRipDownloadRepository>()
                  .Setup(r => r.FindByDownloadId(downloadId))
                  .Returns(new SiteRipDownload
                  {
                      Id = siteRipDownloadId,
                      DownloadId = downloadId,
                      SeriesId = 5
                  });

            Mocker.GetMock<ISiteRipDownloadFileRepository>()
                  .Setup(r => r.GetUnimportedByDownloadId(siteRipDownloadId))
                  .Returns(new List<SiteRipDownloadFile>());

            Mocker.GetMock<ISiteRipPendingFileService>()
                  .Setup(s => s.HasPendingFiles(siteRipDownloadId))
                  .Returns(true);

            Mocker.GetMock<ISiteRipPendingFileService>()
                  .Setup(s => s.GetPendingFiles(siteRipDownloadId))
                  .Returns(new List<SiteRipDownloadFile>
                  {
                      new SiteRipDownloadFile { EpisodeId = 100, FileIndex = 1, Imported = true },
                      new SiteRipDownloadFile { EpisodeId = 101, FileIndex = 2, Imported = true }
                  });

            Mocker.GetMock<ISeriesService>()
                  .Setup(s => s.GetSeries(5))
                  .Returns(new Series { Id = 5 });

            Mocker.GetMock<IEpisodeService>()
                  .Setup(s => s.GetEpisodes(It.IsAny<IEnumerable<int>>()))
                  .Returns(new List<Episode>
                  {
                      new Episode { Id = 100, SeriesId = 5, EpisodeFileId = 0 },
                      new Episode { Id = 101, SeriesId = 5, EpisodeFileId = 0 }
                  });

            Mocker.GetMock<ICustomFormatCalculationService>()
                  .Setup(s => s.ParseCustomFormat(It.IsAny<RemoteEpisode>(), It.IsAny<long>()))
                  .Returns(new List<CustomFormat>());

            var trackedDownload = Subject.TrackDownload(client, item);

            trackedDownload.RemoteEpisode.Episodes.Should().HaveCount(2);
            trackedDownload.RemoteEpisode.Episodes.Select(e => e.Id).Should().BeEquivalentTo(new[] { 100, 101 });
        }
    }
}
