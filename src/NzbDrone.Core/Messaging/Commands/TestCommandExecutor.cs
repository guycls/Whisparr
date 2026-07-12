using System;
using System.Threading;
using NLog;
using NzbDrone.Common.Instrumentation.Extensions;

namespace NzbDrone.Core.Messaging.Commands
{
    public class TestCommandExecutor : IExecute<TestCommand>
    {
        private readonly Logger _logger;

        public TestCommandExecutor(Logger logger)
        {
            _logger = logger;
        }

        public void Execute(TestCommand message)
        {
            _logger.ProgressInfo("Starting Test command. duration {0}", message.Duration);

            var remaining = message.Duration;

            while (remaining > 0)
            {
                CommandCancellation.ThrowIfCancelled();

                var sleep = Math.Min(remaining, 100);
                Thread.Sleep(sleep);
                remaining -= sleep;
            }

            _logger.ProgressInfo("Completed Test command");
        }
    }
}
