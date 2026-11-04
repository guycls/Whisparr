using NzbDrone.Core.Datastore;

namespace NzbDrone.Core.MediaFiles
{
    public class EpisodeFileHardLink : ModelBase
    {
        public int EpisodeFileId { get; set; }
        public string Path { get; set; }
    }
}
