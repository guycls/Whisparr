using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Core.Messaging.Commands;
using NzbDrone.Core.Messaging.Events;
using NzbDrone.Core.ProgressMessaging;
using NzbDrone.Core.Test.Framework;
using NzbDrone.Core.Tv.Commands;

namespace NzbDrone.Core.Test.Messaging.Commands
{
    [TestFixture]
    public class CommandProgressReporterFixture : CoreTest<CommandProgressReporter>
    {
        private CommandModel _command;

        [SetUp]
        public void Setup()
        {
            _command = new CommandModel
            {
                Body = new RefreshSeriesCommand(),
                Status = CommandStatus.Started
            };

            ProgressMessageContext.CommandModel = _command;
        }

        [TearDown]
        public void TearDown()
        {
            ProgressMessageContext.CommandModel = null;
        }

        [Test]
        public void should_set_progress_and_publish_event()
        {
            Subject.ReportSceneProgress("Studio A", 56, 100);

            _command.ProgressStudio.Should().Be("Studio A");
            _command.ProgressPercent.Should().Be(56);

            Mocker.GetMock<IManageCommandQueue>()
                  .Verify(v => v.SetProgress(_command, "Studio A", 56, 100), Times.Once());

            VerifyEventPublished<CommandUpdatedEvent>();
        }

        [Test]
        public void should_not_publish_when_percent_unchanged()
        {
            _command.ProgressStudio = "Studio A";
            _command.ProgressPercent = 56;

            Subject.ReportSceneProgress("Studio A", 56, 100);

            Mocker.GetMock<IManageCommandQueue>()
                  .Verify(v => v.SetProgress(It.IsAny<CommandModel>(), It.IsAny<string>(), It.IsAny<int>(), It.IsAny<int>()), Times.Never());

            VerifyEventPublished<CommandUpdatedEvent>(Times.Never());
        }

        [Test]
        public void should_noop_when_command_is_null()
        {
            ProgressMessageContext.CommandModel = null;

            Subject.ReportSceneProgress("Studio A", 1, 10);

            Mocker.GetMock<IManageCommandQueue>()
                  .Verify(v => v.SetProgress(It.IsAny<CommandModel>(), It.IsAny<string>(), It.IsAny<int>(), It.IsAny<int>()), Times.Never());
        }
    }
}
