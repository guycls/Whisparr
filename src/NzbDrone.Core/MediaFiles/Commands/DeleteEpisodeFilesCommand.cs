using System.Collections.Generic;
using NzbDrone.Core.Messaging.Commands;

namespace NzbDrone.Core.MediaFiles.Commands
{
    public class DeleteEpisodeFilesCommand : Command
    {
        public List<int> EpisodeFileIds { get; set; }

        public override bool SendUpdatesToClient => true;
        public override bool RequiresDiskAccess => true;

        public DeleteEpisodeFilesCommand()
        {
            EpisodeFileIds = new List<int>();
        }
    }
}
