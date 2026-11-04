using System.Collections.Generic;
using NzbDrone.Core.Datastore;

namespace NzbDrone.Core.Tv
{
    public class SeriesSceneBookmark : ModelBase
    {
        public SeriesSceneBookmark()
        {
            ReleaseDateAscending = new List<int>();
            ReleaseDateDescending = new List<int>();
            TitleAscending = new List<int>();
            TitleDescending = new List<int>();
        }

        public int SeriesId { get; set; }
        public List<int> ReleaseDateAscending { get; set; }
        public List<int> ReleaseDateDescending { get; set; }
        public List<int> TitleAscending { get; set; }
        public List<int> TitleDescending { get; set; }
    }
}
