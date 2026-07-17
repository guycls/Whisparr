using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using NUnit.Framework;
using NzbDrone.Core.Indexers;
using NzbDrone.Core.IndexerSearch;
using NzbDrone.Core.Messaging.Commands;

namespace NzbDrone.Core.Test.Messaging.Commands
{
    [TestFixture]
    public class CommandQueueFixture
    {
        [Test]
        public void should_not_dequeue_second_series_search_while_first_is_started()
        {
            var queue = new CommandQueue();
            var first = CreateCommandModel(new SeriesSearchCommand(1));
            var second = CreateCommandModel(new SeriesSearchCommand(2));

            queue.Add(first);
            queue.Add(second);

            using var cts = new CancellationTokenSource();

            var firstCommand = queue.GetConsumingEnumerable(cts.Token).First();
            firstCommand.Should().BeSameAs(first);
            firstCommand.Status.Should().Be(CommandStatus.Started);

            var secondTask = Task.Run(() => queue.GetConsumingEnumerable(cts.Token).First());
            Task.Delay(100).Wait();
            secondTask.IsCompleted.Should().BeFalse();

            first.Status = CommandStatus.Completed;
            queue.PulseAllConsumers();

            var secondCommand = secondTask.Result;
            secondCommand.Should().BeSameAs(second);
        }

        [Test]
        public void should_dequeue_other_commands_while_series_search_is_started()
        {
            var queue = new CommandQueue();
            var seriesSearch = CreateCommandModel(new SeriesSearchCommand(1));
            var rssSync = CreateCommandModel(new RssSyncCommand());

            queue.Add(seriesSearch);
            queue.Add(rssSync);

            using var cts = new CancellationTokenSource();

            var startedSearch = queue.GetConsumingEnumerable(cts.Token).First();
            startedSearch.Should().BeSameAs(seriesSearch);

            var rssCommand = queue.GetConsumingEnumerable(cts.Token).First();
            rssCommand.Should().BeSameAs(rssSync);
        }

        private static CommandModel CreateCommandModel(Command body)
        {
            return new CommandModel
            {
                Name = body.Name,
                Body = body,
                QueuedAt = DateTime.UtcNow,
                Status = CommandStatus.Queued
            };
        }
    }
}
