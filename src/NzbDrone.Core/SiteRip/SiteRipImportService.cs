using System.Collections.Generic;
using System.Linq;
using NLog;
using NzbDrone.Common.Disk;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.Download;
using NzbDrone.Core.Download.Clients;
using NzbDrone.Core.Download.Clients.QBittorrent;
using NzbDrone.Core.Download.TrackedDownloads;
using NzbDrone.Core.MediaFiles;
using NzbDrone.Core.MediaFiles.EpisodeImport;
using NzbDrone.Core.Tv;

namespace NzbDrone.Core.SiteRip
{
    public interface ISiteRipImportService
    {
        void ProcessActiveDownloads(IEnumerable<TrackedDownload> trackedDownloads);
    }

    public class SiteRipImportService : ISiteRipImportService
    {
        private readonly ISiteRipDownloadRepository _siteRipDownloadRepository;
        private readonly ISiteRipDownloadFileRepository _siteRipDownloadFileRepository;
        private readonly ISiteRipPendingFileService _siteRipPendingFileService;
        private readonly IDownloadClientFactory _downloadClientFactory;
        private readonly ISeriesService _seriesService;
        private readonly IDownloadedEpisodesImportService _downloadedEpisodesImportService;
        private readonly IDiskProvider _diskProvider;
        private readonly Logger _logger;

        public SiteRipImportService(ISiteRipDownloadRepository siteRipDownloadRepository,
                                    ISiteRipDownloadFileRepository siteRipDownloadFileRepository,
                                    ISiteRipPendingFileService siteRipPendingFileService,
                                    IDownloadClientFactory downloadClientFactory,
                                    ISeriesService seriesService,
                                    IDownloadedEpisodesImportService downloadedEpisodesImportService,
                                    IDiskProvider diskProvider,
                                    Logger logger)
        {
            _siteRipDownloadRepository = siteRipDownloadRepository;
            _siteRipDownloadFileRepository = siteRipDownloadFileRepository;
            _siteRipPendingFileService = siteRipPendingFileService;
            _downloadClientFactory = downloadClientFactory;
            _seriesService = seriesService;
            _downloadedEpisodesImportService = downloadedEpisodesImportService;
            _diskProvider = diskProvider;
            _logger = logger;
        }

        public void ProcessActiveDownloads(IEnumerable<TrackedDownload> trackedDownloads)
        {
            foreach (var trackedDownload in trackedDownloads)
            {
                if (trackedDownload.State != TrackedDownloadState.Downloading &&
                    trackedDownload.State != TrackedDownloadState.ImportPending)
                {
                    continue;
                }

                var siteRipDownload = _siteRipDownloadRepository.FindByDownloadId(trackedDownload.DownloadItem.DownloadId);

                if (siteRipDownload == null)
                {
                    continue;
                }

                TryImportCompletedFiles(trackedDownload, siteRipDownload);
            }
        }

        private void TryImportCompletedFiles(TrackedDownload trackedDownload, SiteRipDownload siteRipDownload)
        {
            var qbit = _downloadClientFactory.GetAvailableProviders()
                .FirstOrDefault(c => c.Definition.Id == siteRipDownload.DownloadClientId) as QBittorrent;

            if (qbit == null)
            {
                _logger.Debug("SiteRIP import skipped for {0}: qBittorrent client {1} unavailable", trackedDownload.DownloadItem.Title, siteRipDownload.DownloadClientId);
                return;
            }

            var torrentFiles = qbit.GetTorrentFileList(trackedDownload.DownloadItem.DownloadId);
            var pendingFiles = _siteRipPendingFileService.GetPendingFiles(siteRipDownload.Id);

            if (pendingFiles.Empty())
            {
                return;
            }

            var episodeGroups = pendingFiles.GroupBy(f => f.EpisodeId);

            foreach (var episodeGroup in episodeGroups)
            {
                var episodeFileIndices = episodeGroup.Select(f => f.FileIndex).ToList();
                var allComplete = episodeFileIndices.All(index =>
                {
                    var torrentFile = torrentFiles.FirstOrDefault(f => f.Index == index);
                    return torrentFile != null && torrentFile.Progress >= 1.0;
                });

                if (!allComplete)
                {
                    MarkEpisodeFilesPending(episodeGroup);
                    _logger.Debug("SiteRIP import waiting for episode {0} from {1}: not all torrent files complete", episodeGroup.Key, trackedDownload.DownloadItem.Title);
                    continue;
                }

                var series = _seriesService.GetSeries(siteRipDownload.SeriesId);
                var importedIndices = new HashSet<int>();

                foreach (var torrentFile in torrentFiles.Where(f => episodeFileIndices.Contains(f.Index)))
                {
                    var filePath = qbit.GetTorrentFileFullPath(trackedDownload.DownloadItem.DownloadId, torrentFile.Name);

                    if (!_diskProvider.FileExists(filePath))
                    {
                        _logger.Debug("SiteRIP file not on disk yet for episode {0}: {1}", episodeGroup.Key, filePath);
                        continue;
                    }

                    var importResults = _downloadedEpisodesImportService.ProcessPath(
                        filePath,
                        ImportMode.Auto,
                        series,
                        trackedDownload.DownloadItem,
                        new List<int> { episodeGroup.Key });

                    if (importResults.Any(r => r.Result == ImportResultType.Imported))
                    {
                        importedIndices.Add(torrentFile.Index);
                    }
                    else
                    {
                        foreach (var file in episodeGroup)
                        {
                            file.Imported = false;
                            _siteRipDownloadFileRepository.Update(file);
                        }

                        _logger.Debug("SiteRIP import failed for episode {0} from file {1}", episodeGroup.Key, filePath);
                    }
                }

                if (!episodeFileIndices.All(importedIndices.Contains))
                {
                    MarkEpisodeFilesPending(episodeGroup);
                    _logger.Debug("SiteRIP import deferred for episode {0} from {1}: waiting for {2} file(s) on disk",
                        episodeGroup.Key,
                        trackedDownload.DownloadItem.Title,
                        episodeFileIndices.Count - importedIndices.Count);
                    continue;
                }

                foreach (var file in episodeGroup)
                {
                    file.Imported = true;
                    _siteRipDownloadFileRepository.Update(file);
                }

                _logger.Info("SiteRIP imported files for episode {0} from {1}", episodeGroup.Key, trackedDownload.DownloadItem.Title);
            }
        }

        private void MarkEpisodeFilesPending(IEnumerable<SiteRipDownloadFile> files)
        {
            foreach (var file in files)
            {
                if (!file.Imported)
                {
                    continue;
                }

                file.Imported = false;
                _siteRipDownloadFileRepository.Update(file);
            }
        }
    }
}
