using NzbDrone.Core.Messaging.Commands;

namespace NzbDrone.Core.Notifications.Stash
{
    public class StashSyncCommand : Command
    {
        public int? NotificationId { get; set; }

        public override bool SendUpdatesToClient => true;
        public override bool RequiresDiskAccess => true;
    }
}
