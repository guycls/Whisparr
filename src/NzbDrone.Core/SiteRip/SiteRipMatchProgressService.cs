using System;
using System.Collections.Generic;
using NzbDrone.Common.Cache;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.Localization;

namespace NzbDrone.Core.SiteRip
{
    public interface ISiteRipMatchProgressService
    {
        void Start(string matchId);
        void ReportFetchingMetadata(string matchId);
        void ReportParsingFiles(string matchId, int fileCount);
        void ReportMatching(string matchId, int completedFiles, int totalFiles);
        void Complete(string matchId, List<TorrentFileMetadata> torrentFiles, List<SiteRipMatchResult> matches);
        void Fail(string matchId, string error);
        SiteRipMatchProgress Get(string matchId);
        void Clear(string matchId);
    }

    public class SiteRipMatchProgressService : ISiteRipMatchProgressService
    {
        private static readonly TimeSpan CacheTtl = TimeSpan.FromMinutes(2);

        private readonly ICached<SiteRipMatchProgress> _cache;
        private readonly ILocalizationService _localizationService;

        public SiteRipMatchProgressService(ICacheManager cacheManager, ILocalizationService localizationService)
        {
            _cache = cacheManager.GetCache<SiteRipMatchProgress>(GetType());
            _localizationService = localizationService;
        }

        public void Start(string matchId)
        {
            if (matchId.IsNullOrWhiteSpace())
            {
                return;
            }

            Update(matchId, new SiteRipMatchProgress
            {
                Phase = "starting",
                Message = _localizationService.GetLocalizedString("SiteRipMatchingScenes")
            });
        }

        public void ReportFetchingMetadata(string matchId)
        {
            if (matchId.IsNullOrWhiteSpace())
            {
                return;
            }

            Update(matchId, new SiteRipMatchProgress
            {
                Phase = "fetching_metadata",
                Message = _localizationService.GetLocalizedString("SiteRipDownloadingTorrentMetadata")
            });
        }

        public void ReportParsingFiles(string matchId, int fileCount)
        {
            if (matchId.IsNullOrWhiteSpace())
            {
                return;
            }

            var template = _localizationService.GetLocalizedString("SiteRipParsingFilesCount");
            var message = string.Format(template, fileCount);

            Update(matchId, new SiteRipMatchProgress
            {
                Phase = "parsing_files",
                Message = message,
                TotalFiles = fileCount
            });
        }

        public void ReportMatching(string matchId, int completedFiles, int totalFiles)
        {
            if (matchId.IsNullOrWhiteSpace())
            {
                return;
            }

            var template = _localizationService.GetLocalizedString("SiteRipMatchingProgress");
            var message = string.Format(template, completedFiles, totalFiles);

            Update(matchId, new SiteRipMatchProgress
            {
                Phase = "matching",
                Message = message,
                TotalFiles = totalFiles,
                CompletedFiles = completedFiles
            });
        }

        public void Complete(string matchId, List<TorrentFileMetadata> torrentFiles, List<SiteRipMatchResult> matches)
        {
            if (matchId.IsNullOrWhiteSpace())
            {
                return;
            }

            var progress = Get(matchId) ?? new SiteRipMatchProgress();

            progress.Phase = "completed";
            progress.IsComplete = true;
            progress.Message = _localizationService.GetLocalizedString("SiteRipMatchingComplete");
            progress.TotalFiles = torrentFiles?.Count ?? progress.TotalFiles;
            progress.CompletedFiles = progress.TotalFiles;
            progress.TorrentFiles = torrentFiles;
            progress.Matches = matches;

            _cache.Set(matchId, progress, CacheTtl);
        }

        public void Fail(string matchId, string error)
        {
            if (matchId.IsNullOrWhiteSpace())
            {
                return;
            }

            Update(matchId, new SiteRipMatchProgress
            {
                Phase = "failed",
                IsComplete = true,
                Error = error,
                Message = error
            });
        }

        public SiteRipMatchProgress Get(string matchId)
        {
            if (matchId.IsNullOrWhiteSpace())
            {
                return null;
            }

            return _cache.Find(matchId);
        }

        public void Clear(string matchId)
        {
            if (matchId.IsNullOrWhiteSpace())
            {
                return;
            }

            _cache.Remove(matchId);
        }

        private void Update(string matchId, SiteRipMatchProgress progress)
        {
            _cache.Set(matchId, progress, CacheTtl);
        }
    }
}
