using NzbDrone.Core.Messaging.Commands;

namespace NzbDrone.Core.Notifications.Stash
{
    public class StashFullImportCommand : Command
    {
        public override bool SendUpdatesToClient => true;
        public override bool RequiresDiskAccess => true;
        public override bool IsLongRunning => true;
        public override bool UpdateScheduledTask => false;
    }
}
