using System.Collections.Generic;
using System.Linq;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.Messaging.Events;

namespace NzbDrone.Core.MediaFiles
{
    public interface IEpisodeFileHardLinkRepository : IBasicRepository<EpisodeFileHardLink>
    {
        List<EpisodeFileHardLink> GetByEpisodeFileIds(List<int> episodeFileIds);
        void ReplacePaths(int episodeFileId, List<string> paths);
        void DeleteForEpisodeFile(int episodeFileId);
        void RetargetPath(int episodeFileId, string oldPath, string newPath);
    }

    public class EpisodeFileHardLinkRepository : BasicRepository<EpisodeFileHardLink>, IEpisodeFileHardLinkRepository
    {
        public EpisodeFileHardLinkRepository(IMainDatabase database, IEventAggregator eventAggregator)
            : base(database, eventAggregator)
        {
        }

        public List<EpisodeFileHardLink> GetByEpisodeFileIds(List<int> episodeFileIds)
        {
            if (episodeFileIds == null || episodeFileIds.Count == 0)
            {
                return new List<EpisodeFileHardLink>();
            }

            return Query(x => episodeFileIds.Contains(x.EpisodeFileId)).ToList();
        }

        public void ReplacePaths(int episodeFileId, List<string> paths)
        {
            Delete(x => x.EpisodeFileId == episodeFileId);

            var rows = new List<EpisodeFileHardLink>();

            foreach (var path in paths ?? new List<string>())
            {
                if (path.IsNullOrWhiteSpace() || rows.Any(row => row.Path.PathEquals(path)))
                {
                    continue;
                }

                rows.Add(new EpisodeFileHardLink
                {
                    EpisodeFileId = episodeFileId,
                    Path = path
                });
            }

            if (rows.Count > 0)
            {
                InsertMany(rows);
            }
        }

        public void DeleteForEpisodeFile(int episodeFileId)
        {
            Delete(x => x.EpisodeFileId == episodeFileId);
        }

        public void RetargetPath(int episodeFileId, string oldPath, string newPath)
        {
            if (episodeFileId <= 0 || oldPath.IsNullOrWhiteSpace() || newPath.IsNullOrWhiteSpace() || oldPath.PathEquals(newPath))
            {
                return;
            }

            var match = Query(x => x.EpisodeFileId == episodeFileId).FirstOrDefault(link => link.Path.PathEquals(oldPath));

            if (match == null)
            {
                return;
            }

            match.Path = newPath;
            Update(match);
        }
    }
}
