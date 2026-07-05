using System;
using Microsoft.AspNetCore.Mvc;
using NzbDrone.Core.Messaging.Commands;
using NzbDrone.Core.Notifications;
using NzbDrone.Core.Notifications.Stash;
using Whisparr.Http;

namespace Whisparr.Api.V3.Notifications
{
    [V3ApiController]
    public class NotificationController : ProviderControllerBase<NotificationResource, NotificationBulkResource, INotification, NotificationDefinition>
    {
        public static readonly NotificationResourceMapper ResourceMapper = new ();
        public static readonly NotificationBulkResourceMapper BulkResourceMapper = new ();

        private readonly IManageCommandQueue _commandQueueManager;

        public NotificationController(NotificationFactory notificationFactory,
                                      IManageCommandQueue commandQueueManager)
            : base(notificationFactory, "notification", ResourceMapper, BulkResourceMapper)
        {
            _commandQueueManager = commandQueueManager;
        }

        [HttpPost("stash/sync")]
        public ActionResult<StashSyncResponse> SyncFromStash()
        {
            var command = _commandQueueManager.Push(new StashSyncCommand(), CommandPriority.Normal, CommandTrigger.Manual);

            return Ok(new StashSyncResponse { CommandId = command.Id });
        }

        [NonAction]
        public override ActionResult<NotificationResource> UpdateProvider([FromBody] NotificationBulkResource providerResource)
        {
            throw new NotImplementedException();
        }

        [NonAction]
        public override object DeleteProviders([FromBody] NotificationBulkResource resource)
        {
            throw new NotImplementedException();
        }
    }
}
