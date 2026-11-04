namespace NzbDrone.Common.Disk
{
    public class FileLinkIdentity
    {
        public string VolumeId { get; set; }
        public string FileId { get; set; }
        public int LinkCount { get; set; }

        public string Key
        {
            get { return VolumeId + ":" + FileId; }
        }
    }
}
