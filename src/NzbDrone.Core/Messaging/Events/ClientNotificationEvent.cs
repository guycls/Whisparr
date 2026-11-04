using NzbDrone.Common.Messaging;

namespace NzbDrone.Core.Messaging.Events
{
    public class ClientNotificationEvent : IEvent
    {
        public string Message { get; private set; }
        public string Type { get; private set; }

        public ClientNotificationEvent(string message, string type = "error")
        {
            Message = message;
            Type = type;
        }
    }
}
