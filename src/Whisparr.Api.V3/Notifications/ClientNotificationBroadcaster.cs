using NzbDrone.Core.Messaging.Events;
using NzbDrone.SignalR;

namespace Whisparr.Api.V3.Notifications
{
    public class ClientNotificationBroadcaster : IHandle<ClientNotificationEvent>
    {
        private readonly IBroadcastSignalRMessage _signalRBroadcaster;

        public ClientNotificationBroadcaster(IBroadcastSignalRMessage signalRBroadcaster)
        {
            _signalRBroadcaster = signalRBroadcaster;
        }

        public void Handle(ClientNotificationEvent message)
        {
            if (!_signalRBroadcaster.IsConnected)
            {
                return;
            }

            _signalRBroadcaster.BroadcastMessage(new SignalRMessage
            {
                Name = "notification",
                Body = new
                {
                    Message = message.Message,
                    Type = message.Type
                }
            });
        }
    }
}
