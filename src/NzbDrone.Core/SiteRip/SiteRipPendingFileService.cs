using System.Collections.Generic;
using System.Linq;
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

        public SiteRipPendingFileService(ISiteRipDownloadFileRepository siteRipDownloadFileRepository,
                                         IEpisodeService episodeService)
        {
            _siteRipDownloadFileRepository = siteRipDownloadFileRepository;
            _episodeService = episodeService;
        }

        public List<SiteRipDownloadFile> GetPendingFiles(int siteRipDownloadId)
        {
            var files = _siteRipDownloadFileRepository.GetByDownloadId(siteRipDownloadId);

            if (files.Empty())
            {
                return files;
            }

            var episodes = _episodeService.GetEpisodes(files.Select(f => f.EpisodeId).Distinct())
                                          .ToDictionary(e => e.Id);

            return files.Where(f =>
            {
                if (!episodes.TryGetValue(f.EpisodeId, out var episode))
                {
                    return true;
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
