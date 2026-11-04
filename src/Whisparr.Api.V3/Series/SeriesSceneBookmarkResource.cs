using System.Collections.Generic;
using NzbDrone.Core.Tv;

namespace Whisparr.Api.V3.Series
{
    public class SeriesSceneBookmarkResource
    {
        public int SeriesId { get; set; }
        public List<int> ReleaseDateAscending { get; set; }
        public List<int> ReleaseDateDescending { get; set; }
        public List<int> TitleAscending { get; set; }
        public List<int> TitleDescending { get; set; }
    }

    public class SeriesSceneBookmarkToggleResource
    {
        public string SortKey { get; set; }
        public string SortDirection { get; set; }
        public int EpisodeId { get; set; }
    }

    public static class SeriesSceneBookmarkResourceMapper
    {
        public static SeriesSceneBookmarkResource ToResource(this SeriesSceneBookmark model)
        {
            if (model == null)
            {
                return null;
            }

            return new SeriesSceneBookmarkResource
            {
                SeriesId = model.SeriesId,
                ReleaseDateAscending = model.ReleaseDateAscending ?? new List<int>(),
                ReleaseDateDescending = model.ReleaseDateDescending ?? new List<int>(),
                TitleAscending = model.TitleAscending ?? new List<int>(),
                TitleDescending = model.TitleDescending ?? new List<int>()
            };
        }
    }
}
