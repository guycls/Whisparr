using System;
using Microsoft.AspNetCore.Mvc;
using NzbDrone.Common.TPL;
using NzbDrone.Core.Datastore.Events;
using NzbDrone.Core.Download.Pending;
using NzbDrone.Core.Messaging.Events;
using NzbDrone.Core.Queue;
using NzbDrone.SignalR;
using Whisparr.Http;
using Whisparr.Http.REST;

namespace Whisparr.Api.V3.Queue
{
    [V3ApiController("queue/status")]
    public class QueueStatusController : RestControllerWithSignalR<QueueStatusResource, NzbDrone.Core.Queue.Queue>,
                               IHandle<QueueUpdatedEvent>, IHandle<PendingReleasesUpdatedEvent>
    {
        private readonly IQueueStatusService _queueStatusService;
        private readonly Debouncer _broadcastDebounce;

        public QueueStatusController(IBroadcastSignalRMessage broadcastSignalRMessage, IQueueStatusService queueStatusService)
            : base(broadcastSignalRMessage)
        {
            _queueStatusService = queueStatusService;

            _broadcastDebounce = new Debouncer(BroadcastChange, TimeSpan.FromSeconds(5));
        }

        [NonAction]
        public override ActionResult<QueueStatusResource> GetResourceByIdWithErrorHandler(int id)
        {
            return base.GetResourceByIdWithErrorHandler(id);
        }

        protected override QueueStatusResource GetResourceById(int id)
        {
            throw new NotImplementedException();
        }

        [HttpGet]
        [Produces("application/json")]
        public QueueStatusResource GetQueueStatus()
        {
            _broadcastDebounce.Pause();

            var resource = MapToResource(_queueStatusService.GetSnapshot());

            _broadcastDebounce.Resume();

            return resource;
        }

        private void BroadcastChange()
        {
            BroadcastResourceChange(ModelAction.Updated, MapToResource(_queueStatusService.GetSnapshot()));
        }

        private static QueueStatusResource MapToResource(QueueStatusSnapshot snapshot)
        {
            return new QueueStatusResource
            {
                TotalCount = snapshot.TotalCount,
                Count = snapshot.Count,
                UnknownCount = snapshot.UnknownCount,
                Errors = snapshot.Errors,
                Warnings = snapshot.Warnings,
                UnknownErrors = snapshot.UnknownErrors,
                UnknownWarnings = snapshot.UnknownWarnings
            };
        }

        [NonAction]
        public void Handle(QueueUpdatedEvent message)
        {
            _broadcastDebounce.Execute();
        }

        [NonAction]
        public void Handle(PendingReleasesUpdatedEvent message)
        {
            _broadcastDebounce.Execute();
        }
    }
}
