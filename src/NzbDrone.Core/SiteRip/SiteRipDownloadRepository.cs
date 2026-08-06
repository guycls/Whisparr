using System.Collections.Generic;
using System.Linq;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.Messaging.Events;

namespace NzbDrone.Core.SiteRip
{
    public interface ISiteRipDownloadRepository : IBasicRepository<SiteRipDownload>
    {
        SiteRipDownload FindByDownloadId(string downloadId);
    }

    public class SiteRipDownloadRepository : BasicRepository<SiteRipDownload>, ISiteRipDownloadRepository
    {
        public SiteRipDownloadRepository(IMainDatabase database, IEventAggregator eventAggregator)
            : base(database, eventAggregator)
        {
        }

        public SiteRipDownload FindByDownloadId(string downloadId)
        {
            if (downloadId.IsNullOrWhiteSpace())
            {
                return null;
            }

            var normalized = downloadId.ToLowerInvariant();

            return Query(x => x.DownloadId == normalized).FirstOrDefault();
        }
    }

    public interface ISiteRipDownloadFileRepository : IBasicRepository<SiteRipDownloadFile>
    {
        List<SiteRipDownloadFile> GetByDownloadId(int siteRipDownloadId);
        List<SiteRipDownloadFile> GetByEpisodeId(int episodeId);
        List<SiteRipDownloadFile> GetUnimportedByDownloadId(int siteRipDownloadId);
        List<int> GetFileIndicesByEpisodes(int siteRipDownloadId, IEnumerable<int> episodeIds);
        void DeleteForEpisodes(int siteRipDownloadId, IEnumerable<int> episodeIds);
    }

    public class SiteRipDownloadFileRepository : BasicRepository<SiteRipDownloadFile>, ISiteRipDownloadFileRepository
    {
        public SiteRipDownloadFileRepository(IMainDatabase database, IEventAggregator eventAggregator)
            : base(database, eventAggregator)
        {
        }

        public List<SiteRipDownloadFile> GetByDownloadId(int siteRipDownloadId)
        {
            return Query(x => x.SiteRipDownloadId == siteRipDownloadId);
        }

        public List<SiteRipDownloadFile> GetByEpisodeId(int episodeId)
        {
            return Query(x => x.EpisodeId == episodeId);
        }

        public List<SiteRipDownloadFile> GetUnimportedByDownloadId(int siteRipDownloadId)
        {
            return Query(x => x.SiteRipDownloadId == siteRipDownloadId && !x.Imported);
        }

        public List<int> GetFileIndicesByEpisodes(int siteRipDownloadId, IEnumerable<int> episodeIds)
        {
            var episodeIdList = episodeIds.ToList();

            if (episodeIdList.Empty())
            {
                return new List<int>();
            }

            return Query(x => x.SiteRipDownloadId == siteRipDownloadId && episodeIdList.Contains(x.EpisodeId))
                .Select(x => x.FileIndex)
                .Distinct()
                .ToList();
        }

        public void DeleteForEpisodes(int siteRipDownloadId, IEnumerable<int> episodeIds)
        {
            var episodeIdList = episodeIds.ToList();

            if (episodeIdList.Empty())
            {
                return;
            }

            Delete(x => x.SiteRipDownloadId == siteRipDownloadId && episodeIdList.Contains(x.EpisodeId));
        }
    }
}
