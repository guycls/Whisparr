using System;
using System.Collections.Generic;
using System.Linq;
using NzbDrone.Core.Messaging.Events;
using NzbDrone.Core.Tv.Events;

namespace NzbDrone.Core.Tv
{
    public interface ISeriesSceneBookmarkService
    {
        SeriesSceneBookmark Get(int seriesId);
        SeriesSceneBookmark Toggle(int seriesId, string sortKey, string sortDirection, int episodeId);
    }

    public class SeriesSceneBookmarkService : ISeriesSceneBookmarkService, IHandle<SeriesDeletedEvent>
    {
        private readonly ISeriesSceneBookmarkRepository _repository;
        private readonly ISeriesService _seriesService;
        private readonly IEpisodeService _episodeService;

        public SeriesSceneBookmarkService(ISeriesSceneBookmarkRepository repository,
                                           ISeriesService seriesService,
                                           IEpisodeService episodeService)
        {
            _repository = repository;
            _seriesService = seriesService;
            _episodeService = episodeService;
        }

        public SeriesSceneBookmark Get(int seriesId)
        {
            _seriesService.GetSeries(seriesId);

            return Normalize(_repository.FindBySeriesId(seriesId)) ?? Empty(seriesId);
        }

        public SeriesSceneBookmark Toggle(int seriesId, string sortKey, string sortDirection, int episodeId)
        {
            _seriesService.GetSeries(seriesId);

            if (episodeId <= 0)
            {
                throw new ArgumentException("episodeId must be provided");
            }

            if (!TryParseSort(sortKey, sortDirection, out var sort))
            {
                throw new ArgumentException("sortKey and sortDirection must be a date or title sort");
            }

            var episode = _episodeService.GetEpisode(episodeId);

            if (episode.SeriesId != seriesId)
            {
                throw new ArgumentException("Episode does not belong to this series");
            }

            var bookmark = Normalize(_repository.FindBySeriesId(seriesId));
            var isNew = bookmark == null;

            if (isNew)
            {
                bookmark = Empty(seriesId);
            }

            var list = Copy(ListFor(bookmark, sort));

            if (list.Contains(episodeId))
            {
                list.RemoveAll(id => id == episodeId);
            }
            else
            {
                list.Add(episodeId);
            }

            Assign(bookmark, sort, list);

            if (isNew)
            {
                _repository.Insert(bookmark);
            }
            else
            {
                _repository.Update(bookmark);
            }

            return bookmark;
        }

        public void Handle(SeriesDeletedEvent message)
        {
            var seriesIds = message.Series?.Select(series => series.Id).ToList();
            _repository.DeleteBySeriesIds(seriesIds);
        }

        private static SeriesSceneBookmark Empty(int seriesId)
        {
            return new SeriesSceneBookmark
            {
                SeriesId = seriesId
            };
        }

        private static SeriesSceneBookmark Normalize(SeriesSceneBookmark bookmark)
        {
            if (bookmark == null)
            {
                return null;
            }

            bookmark.ReleaseDateAscending = Copy(bookmark.ReleaseDateAscending);
            bookmark.ReleaseDateDescending = Copy(bookmark.ReleaseDateDescending);
            bookmark.TitleAscending = Copy(bookmark.TitleAscending);
            bookmark.TitleDescending = Copy(bookmark.TitleDescending);

            return bookmark;
        }

        private static List<int> Copy(List<int> ids)
        {
            return ids == null ? new List<int>() : ids.Distinct().ToList();
        }

        private static bool TryParseSort(string sortKey, string sortDirection, out BookmarkSort sort)
        {
            var key = (sortKey ?? string.Empty).Trim().ToLowerInvariant();
            var direction = (sortDirection ?? string.Empty).Trim().ToLowerInvariant();
            var isTitle = key == "title" || key == "episodes.title";
            var isDate = key == "releasedate" || key == "episodes.releasedate" || key == "episodes.airdateutc";
            var ascending = direction == "ascending";
            var descending = direction == "descending";

            if ((!isTitle && !isDate) || (!ascending && !descending))
            {
                sort = default;
                return false;
            }

            if (isTitle)
            {
                sort = ascending ? BookmarkSort.TitleAscending : BookmarkSort.TitleDescending;
            }
            else
            {
                sort = ascending ? BookmarkSort.ReleaseDateAscending : BookmarkSort.ReleaseDateDescending;
            }

            return true;
        }

        private static List<int> ListFor(SeriesSceneBookmark bookmark, BookmarkSort sort)
        {
            switch (sort)
            {
                case BookmarkSort.ReleaseDateAscending:
                    return bookmark.ReleaseDateAscending;
                case BookmarkSort.ReleaseDateDescending:
                    return bookmark.ReleaseDateDescending;
                case BookmarkSort.TitleAscending:
                    return bookmark.TitleAscending;
                default:
                    return bookmark.TitleDescending;
            }
        }

        private static void Assign(SeriesSceneBookmark bookmark, BookmarkSort sort, List<int> ids)
        {
            switch (sort)
            {
                case BookmarkSort.ReleaseDateAscending:
                    bookmark.ReleaseDateAscending = ids;
                    break;
                case BookmarkSort.ReleaseDateDescending:
                    bookmark.ReleaseDateDescending = ids;
                    break;
                case BookmarkSort.TitleAscending:
                    bookmark.TitleAscending = ids;
                    break;
                default:
                    bookmark.TitleDescending = ids;
                    break;
            }
        }

        private enum BookmarkSort
        {
            ReleaseDateAscending,
            ReleaseDateDescending,
            TitleAscending,
            TitleDescending
        }
    }
}
