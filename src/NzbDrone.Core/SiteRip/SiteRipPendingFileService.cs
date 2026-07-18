using System.Collections.Generic;
using System.Linq;
using NLog;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.Tv;

namespace NzbDrone.Core.SiteRip
{
    public interface ISiteRipPendingFileService
    {
        List<SiteRipDownloadFile> GetPendingFiles(int siteRipDownloadId);
        bool HasPendingFiles(int siteRipDownloadId);
    }

    public class SiteRipPendingFileService : ISiteRipPendingFileService
    {
        private readonly ISiteRipDownloadFileRepository _siteRipDownloadFileRepository;
        private readonly IEpisodeService _episodeService;
        private readonly Logger _logger;

        public SiteRipPendingFileService(ISiteRipDownloadFileRepository siteRipDownloadFileRepository,
                                         IEpisodeService episodeService,
                                         Logger logger)
        {
            _siteRipDownloadFileRepository = siteRipDownloadFileRepository;
            _episodeService = episodeService;
            _logger = logger;
        }

        public List<SiteRipDownloadFile> GetPendingFiles(int siteRipDownloadId)
        {
            var files = _siteRipDownloadFileRepository.GetByDownloadId(siteRipDownloadId);

            if (files.Empty())
            {
                return files;
            }

            var episodeIds = files.Select(f => f.EpisodeId).Distinct().ToList();
            var episodes = _episodeService.FindEpisodes(episodeIds)
                                          .ToDictionary(e => e.Id);

            var orphanedEpisodeIds = episodeIds.Where(id => !episodes.ContainsKey(id)).ToList();

            if (orphanedEpisodeIds.Any())
            {
                _logger.Warn(
                    "SiteRIP download {0} has {1} pending file(s) referencing deleted episode(s): [{2}]. Removing stale records.",
                    siteRipDownloadId,
                    files.Count(f => orphanedEpisodeIds.Contains(f.EpisodeId)),
                    string.Join(", ", orphanedEpisodeIds));

                _siteRipDownloadFileRepository.DeleteForEpisodes(siteRipDownloadId, orphanedEpisodeIds);
            }

            return files.Where(f =>
            {
                if (!episodes.TryGetValue(f.EpisodeId, out var episode))
                {
                    return false;
                }

                return !episode.HasFile;
            }).ToList();
        }

        public bool HasPendingFiles(int siteRipDownloadId)
        {
            return GetPendingFiles(siteRipDownloadId).Any();
        }
    }
}
