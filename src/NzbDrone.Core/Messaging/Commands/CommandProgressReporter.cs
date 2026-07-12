using NzbDrone.Core.Messaging.Events;
using NzbDrone.Core.ProgressMessaging;

namespace NzbDrone.Core.Messaging.Commands
{
    public interface ICommandProgressReporter
    {
        void ReportSceneProgress(string studioName, int processed, int total);
    }

    public class SceneProgressTracker
    {
        private readonly ICommandProgressReporter _reporter;
        private int _processedScenes;

        public SceneProgressTracker(ICommandProgressReporter reporter, string studioName, int totalScenes)
        {
            _reporter = reporter;
            StudioName = studioName;
            TotalScenes = totalScenes;
        }

        public string StudioName { get; }

        public int TotalScenes { get; }

        public int ProcessedScenes => _processedScenes;

        public void ReportSceneProcessed()
        {
            _processedScenes++;
            var processed = System.Math.Min(_processedScenes, TotalScenes);
            _reporter?.ReportSceneProgress(StudioName, processed, TotalScenes);
        }
    }

    public class CommandProgressReporter : ICommandProgressReporter
    {
        private readonly IManageCommandQueue _commandQueueManager;
        private readonly IEventAggregator _eventAggregator;

        public CommandProgressReporter(IManageCommandQueue commandQueueManager, IEventAggregator eventAggregator)
        {
            _commandQueueManager = commandQueueManager;
            _eventAggregator = eventAggregator;
        }

        public void ReportSceneProgress(string studioName, int processed, int total)
        {
            var command = ProgressMessageContext.CommandModel;

            if (command == null || !command.Body.SendUpdatesToClient)
            {
                return;
            }

            if (!ProgressMessageContext.LockReentrancy())
            {
                return;
            }

            try
            {
                var percent = total > 0 ? (int)System.Math.Round(processed * 100.0 / total) : 0;

                if (command.ProgressStudio == studioName && command.ProgressPercent == percent)
                {
                    return;
                }

                _commandQueueManager.SetProgress(command, studioName, processed, total);
                _eventAggregator.PublishEvent(new CommandUpdatedEvent(command));
            }
            finally
            {
                ProgressMessageContext.UnlockReentrancy();
            }
        }
    }
}
