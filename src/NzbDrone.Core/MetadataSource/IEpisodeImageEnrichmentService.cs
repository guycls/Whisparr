using System.Collections.Generic;
using NzbDrone.Core.Tv;

namespace NzbDrone.Core.MetadataSource
{
    public interface IEpisodeImageEnrichmentService
    {
        void Enrich(IEnumerable<Episode> episodes, IEnumerable<Episode> existingEpisodes = null);
    }
}
