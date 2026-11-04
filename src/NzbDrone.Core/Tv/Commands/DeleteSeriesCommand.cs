using System.Collections.Generic;
using NzbDrone.Core.Messaging.Commands;

namespace NzbDrone.Core.Tv.Commands
{
    public class DeleteSeriesCommand : Command
    {
        public List<int> SeriesIds { get; set; }
        public bool DeleteFiles { get; set; }
        public bool AddImportListExclusion { get; set; }

        public override bool SendUpdatesToClient => true;
        public override bool RequiresDiskAccess => true;

        public DeleteSeriesCommand()
        {
            SeriesIds = new List<int>();
        }
    }
}
