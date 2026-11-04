using System.Collections.Generic;
using System.Linq;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.Messaging.Events;

namespace NzbDrone.Core.MediaFiles
{
    public interface IMediaFileRepository : IBasicRepository<EpisodeFile>
    {
        List<EpisodeFile> GetFilesBySeries(int seriesId);
        List<EpisodeFile> GetFilesBySeason(int seriesId, int seasonNumber);
        List<EpisodeFile> GetFilesWithoutMediaInfo();
        List<EpisodeFile> GetFilesWithRelativePath(int seriesId, string relativePath);
        List<EpisodeFile> GetFilesByHardLinkIdentity(string volumeId, string fileId);
        List<EpisodeFile> FindByIds(List<int> ids);
        void DeleteForSeries(List<int> seriesIds);
    }

    public class MediaFileRepository : BasicRepository<EpisodeFile>, IMediaFileRepository
    {
        public MediaFileRepository(IMainDatabase database, IEventAggregator eventAggregator)
            : base(database, eventAggregator)
        {
        }

        public List<EpisodeFile> GetFilesBySeries(int seriesId)
        {
            return Query(c => c.SeriesId == seriesId).ToList();
        }

        public List<EpisodeFile> GetFilesBySeason(int seriesId, int seasonNumber)
        {
            return Query(c => c.SeriesId == seriesId && c.SeasonNumber == seasonNumber).ToList();
        }

        public List<EpisodeFile> GetFilesWithoutMediaInfo()
        {
            return Query(c => c.MediaInfo == null).ToList();
        }

        public List<EpisodeFile> GetFilesWithRelativePath(int seriesId, string relativePath)
        {
            return Query(c => c.SeriesId == seriesId && c.RelativePath == relativePath)
                        .ToList();
        }

        public List<EpisodeFile> GetFilesByHardLinkIdentity(string volumeId, string fileId)
        {
            if (volumeId.IsNullOrWhiteSpace() || fileId.IsNullOrWhiteSpace())
            {
                return new List<EpisodeFile>();
            }

            return Query(file => file.HardLinkVolumeId == volumeId && file.HardLinkFileId == fileId).ToList();
        }

        public List<EpisodeFile> FindByIds(List<int> ids)
        {
            if (ids == null || ids.Count == 0)
            {
                return new List<EpisodeFile>();
            }

            return Query(file => ids.Contains(file.Id)).ToList();
        }

        public void DeleteForSeries(List<int> seriesIds)
        {
            Delete(x => seriesIds.Contains(x.SeriesId));
        }
    }
}
