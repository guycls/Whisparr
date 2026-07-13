using NzbDrone.Core.Datastore;

namespace NzbDrone.Core.SiteRip
{
    public class SiteRipDownloadFile : ModelBase
    {
        public int SiteRipDownloadId { get; set; }
        public int EpisodeId { get; set; }
        public int FileIndex { get; set; }
        public string FilePath { get; set; }
        public int? PartNumber { get; set; }
        public bool Imported { get; set; }
    }
}
