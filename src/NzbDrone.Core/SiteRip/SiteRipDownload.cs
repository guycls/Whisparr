using System;
using NzbDrone.Core.Datastore;

namespace NzbDrone.Core.SiteRip
{
    public class SiteRipDownload : ModelBase
    {
        public string DownloadId { get; set; }
        public int SeriesId { get; set; }
        public string TorrentTitle { get; set; }
        public int DownloadClientId { get; set; }
    }
}
