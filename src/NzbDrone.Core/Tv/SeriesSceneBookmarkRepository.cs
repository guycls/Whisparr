using System.Collections.Generic;
using System.Linq;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.Messaging.Events;

namespace NzbDrone.Core.Tv
{
    public interface ISeriesSceneBookmarkRepository : IBasicRepository<SeriesSceneBookmark>
    {
        SeriesSceneBookmark FindBySeriesId(int seriesId);
        void DeleteBySeriesIds(List<int> seriesIds);
    }

    public class SeriesSceneBookmarkRepository : BasicRepository<SeriesSceneBookmark>, ISeriesSceneBookmarkRepository
    {
        public SeriesSceneBookmarkRepository(IMainDatabase database, IEventAggregator eventAggregator)
            : base(database, eventAggregator)
        {
        }

        public SeriesSceneBookmark FindBySeriesId(int seriesId)
        {
            return Query(x => x.SeriesId == seriesId).SingleOrDefault();
        }

        public void DeleteBySeriesIds(List<int> seriesIds)
        {
            if (seriesIds == null || seriesIds.Count == 0)
            {
                return;
            }

            Delete(x => seriesIds.Contains(x.SeriesId));
        }
    }
}
