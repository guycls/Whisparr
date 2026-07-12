using System;
using System.Collections.Generic;
using System.Linq;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.Download;
using NzbDrone.Core.Messaging.Commands;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.Messaging.Commands
{
    [TestFixture]
    public class CommandQueueManagerFixture : CoreTest<CommandQueueManager>
    {
        [SetUp]
        public void Setup()
        {
            var id = 0;
            var commands = new List<CommandModel>();

            Mocker.GetMock<ICommandRepository>()
                  .Setup(s => s.Insert(It.IsAny<CommandModel>()))
                  .Returns<CommandModel>(c =>
                  {
                      c.Id = id + 1;
                      commands.Add(c);
                      id++;

                      return c;
                  });

            Mocker.GetMock<ICommandRepository>()
                  .Setup(s => s.Get(It.IsAny<int>()))
                  .Returns<int>(c =>
                  {
                      return commands.SingleOrDefault(e => e.Id == c);
                  });

            Mocker.GetMock<ICommandRepository>()
                  .Setup(s => s.End(It.IsAny<CommandModel>()))
                  .Callback<CommandModel>(c =>
                  {
                      var existing = commands.SingleOrDefault(e => e.Id == c.Id);

                      if (existing != null)
                      {
                          existing.Status = c.Status;
                          existing.Message = c.Message;
                          existing.EndedAt = c.EndedAt;
                          existing.Duration = c.Duration;
                      }
                  });
        }

        [Test]
        public void cancel_queued_should_persist_cancelled_status()
        {
            var command = Subject.Push<RefreshMonitoredDownloadsCommand>(new RefreshMonitoredDownloadsCommand());

            Subject.Cancel(command.Id);

            command.Status.Should().Be(CommandStatus.Cancelled);
            command.Message.Should().Be("Cancelled");

            Mocker.GetMock<ICommandRepository>()
                  .Verify(v => v.End(It.Is<CommandModel>(c => c.Id == command.Id && c.Status == CommandStatus.Cancelled)), Times.Once());
        }

        [Test]
        public void cancel_started_should_cancel_token()
        {
            var command = Subject.Push<RefreshMonitoredDownloadsCommand>(new RefreshMonitoredDownloadsCommand());
            command.StartedAt = DateTime.UtcNow;
            command.Status = CommandStatus.Started;

            var token = Subject.RegisterCancellation(command);

            Subject.Cancel(command.Id);

            token.IsCancellationRequested.Should().BeTrue();
        }

        [Test]
        public void cancel_completed_should_throw()
        {
            var command = Subject.Push<RefreshMonitoredDownloadsCommand>(new RefreshMonitoredDownloadsCommand());
            command.StartedAt = DateTime.UtcNow;
            command.Status = CommandStatus.Completed;

            Action action = () => Subject.Cancel(command.Id);

            action.Should().Throw<NzbDrone.Core.Exceptions.NzbDroneClientException>();
        }

        [Test]
        public void abort_should_set_cancelled_status()
        {
            var command = Subject.Push<RefreshMonitoredDownloadsCommand>(new RefreshMonitoredDownloadsCommand());
            command.StartedAt = DateTime.UtcNow;
            command.Status = CommandStatus.Started;

            Subject.Abort(command, "Cancelled");

            command.Status.Should().Be(CommandStatus.Cancelled);
            command.Message.Should().Be("Cancelled");

            Mocker.GetMock<ICommandRepository>()
                  .Verify(v => v.End(It.Is<CommandModel>(c => c.Id == command.Id && c.Status == CommandStatus.Cancelled)), Times.Once());
        }

        [Test]
        public void set_progress_should_calculate_percent()
        {
            var command = Subject.Push<RefreshMonitoredDownloadsCommand>(new RefreshMonitoredDownloadsCommand());

            Subject.SetProgress(command, "Studio A", 56, 100);

            command.ProgressStudio.Should().Be("Studio A");
            command.ProgressPercent.Should().Be(56);
        }

        [Test]
        public void should_not_remove_commands_for_five_minutes_after_they_end()
        {
            var command = Subject.Push<RefreshMonitoredDownloadsCommand>(new RefreshMonitoredDownloadsCommand());

            // Start the command to mimic CommandQueue's behaviour
            command.StartedAt = DateTime.Now;
            command.Status = CommandStatus.Started;

            Subject.Start(command);
            Subject.Complete(command, "All done");
            Subject.CleanCommands();

            Subject.Get(command.Id).Should().NotBeNull();

            Mocker.GetMock<ICommandRepository>()
                  .Verify(v => v.Get(It.IsAny<int>()), Times.Never());
        }
    }
}
