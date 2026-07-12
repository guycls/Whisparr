using System.Threading;
using NzbDrone.Core.ProgressMessaging;

namespace NzbDrone.Core.Messaging.Commands
{
    public static class CommandCancellation
    {
        public static void ThrowIfCancelled()
        {
            ProgressMessageContext.CancellationToken.ThrowIfCancellationRequested();
        }

        public static CancellationToken Token => ProgressMessageContext.CancellationToken;
    }
}
