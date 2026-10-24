namespace NzbDrone.Core.Notifications.Stash
{
    public class StashFullImportResult
    {
        public int StudiosAdded { get; set; }
        public int Imported { get; set; }
        public int Skipped { get; set; }
        public int Failed { get; set; }
    }
}
