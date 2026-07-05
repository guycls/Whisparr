namespace NzbDrone.Core.Notifications.Stash
{
    public class StashSyncResult
    {
        public int Imported { get; set; }
        public int Scanned { get; set; }
        public int Skipped { get; set; }
        public int Failed { get; set; }
    }
}
