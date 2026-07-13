using System;
using System.Collections.Generic;
using System.Linq;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.Download;
using NzbDrone.Core.Download.Clients.QBittorrent;
using NzbDrone.Core.History;
using NzbDrone.Core.Parser.Model;
using NzbDrone.Core.Tv;

namespace NzbDrone.Core.SiteRip
{
    public interface ISiteRipProgressService
    {
        bool TryGetEpisodeProgress(string downloadId, int episodeId, out long totalSize, out long remainingSize);
        bool IsSiteRipDownload(string downloadId);
        string FormatQueueTitle(Episode episode, string defaultTitle, string downloadId);
    }

    public class SiteRipProgressService : ISiteRipProgressService
    {
        private readonly ISiteRipDownloadRepository _siteRipDownloadRepository;
        private readonly ISiteRipDownloadFileRepository _siteRipDownloadFileRepository;
        private readonly IDownloadClientFactory _downloadClientFactory;
        private readonly IHistoryService _historyService;

        public SiteRipProgressService(ISiteRipDownloadRepository siteRipDownloadRepository,
                                      ISiteRipDownloadFileRepository siteRipDownloadFileRepository,
                                      IDownloadClientFactory downloadClientFactory,
                                      IHistoryService historyService)
        {
            _siteRipDownloadRepository = siteRipDownloadRepository;
            _siteRipDownloadFileRepository = siteRipDownloadFileRepository;
            _downloadClientFactory = downloadClientFactory;
            _historyService = historyService;
        }

        public bool IsSiteRipDownload(string downloadId)
        {
            return _siteRipDownloadRepository.FindByDownloadId(downloadId) != null;
        }

        public string FormatQueueTitle(Episode episode, string defaultTitle, string downloadId)
        {
            if (episode == null)
            {
                return defaultTitle;
            }

            var history = GetGrabbedHistory(downloadId, episode.Id);

            if (IsSiteRipGrab(history, downloadId))
            {
                return $"{episode.Title} [SiteRIP]";
            }

            return defaultTitle;
        }

        private EpisodeHistory GetGrabbedHistory(string downloadId, int episodeId)
        {
            return FindHistoryByDownloadId(downloadId)
                .FirstOrDefault(h => h.EpisodeId == episodeId && h.EventType == EpisodeHistoryEventType.Grabbed);
        }

        private List<EpisodeHistory> FindHistoryByDownloadId(string downloadId)
        {
            if (downloadId.IsNullOrWhiteSpace())
            {
                return new List<EpisodeHistory>();
            }

            var history = _historyService.FindByDownloadId(downloadId);

            if (history.Any())
            {
                return history;
            }

            var alternateId = downloadId.Equals(downloadId.ToUpper(), StringComparison.Ordinal)
                ? downloadId.ToLower()
                : downloadId.ToUpper();

            return _historyService.FindByDownloadId(alternateId);
        }

        private bool IsSiteRipGrab(EpisodeHistory history, string downloadId)
        {
            if (history?.Data?.GetIsSiteRip() == true)
            {
                return true;
            }

            if (history?.Data?.GetValueOrDefault(HistoryDataKeys.ReleaseSource) == nameof(ReleaseSourceType.SiteRip))
            {
                return true;
            }

            return IsSiteRipDownload(downloadId);
        }

        public bool TryGetEpisodeProgress(string downloadId, int episodeId, out long totalSize, out long remainingSize)
        {
            totalSize = 0;
            remainingSize = 0;

            var siteRipDownload = _siteRipDownloadRepository.FindByDownloadId(downloadId);

            if (siteRipDownload == null)
            {
                return false;
            }

            var episodeFiles = _siteRipDownloadFileRepository.GetByDownloadId(siteRipDownload.Id)
                .Where(f => f.EpisodeId == episodeId)
                .ToList();

            if (episodeFiles.Empty())
            {
                return false;
            }

            var qbit = _downloadClientFactory.GetAvailableProviders()
                .FirstOrDefault(c => c.Definition.Id == siteRipDownload.DownloadClientId) as QBittorrent;

            if (qbit == null)
            {
                return false;
            }

            var torrentFiles = qbit.GetTorrentFileList(downloadId);

            foreach (var episodeFile in episodeFiles)
            {
                var torrentFile = torrentFiles.FirstOrDefault(f => f.Index == episodeFile.FileIndex);

                if (torrentFile == null)
                {
                    continue;
                }

                totalSize += torrentFile.Size;
                remainingSize += (long)(torrentFile.Size * (1.0 - torrentFile.Progress));
            }

            return totalSize > 0;
        }
    }
}
