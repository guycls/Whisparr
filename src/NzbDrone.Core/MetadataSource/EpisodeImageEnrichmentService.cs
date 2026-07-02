using System;
using System.Collections.Generic;
using System.Linq;
using NLog;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.MediaCover;
using NzbDrone.Core.MetadataSource.ThePornDb;
using NzbDrone.Core.Tv;

namespace NzbDrone.Core.MetadataSource
{
    public class EpisodeImageEnrichmentService : IEpisodeImageEnrichmentService
    {
        private readonly ITpdbSceneClient _tpdbSceneClient;
        private readonly IConfigService _configService;
        private readonly Logger _logger;

        public EpisodeImageEnrichmentService(ITpdbSceneClient tpdbSceneClient, IConfigService configService, Logger logger)
        {
            _tpdbSceneClient = tpdbSceneClient;
            _configService = configService;
            _logger = logger;
        }

        public void Enrich(IEnumerable<Episode> episodes)
        {
            if (_configService.TpdbApiKey.IsNullOrWhiteSpace())
            {
                return;
            }

            var toEnrich = episodes
                .Where(e => e.TvdbId > 0 && !HasScreenshot(e))
                .ToList();

            if (!toEnrich.Any())
            {
                return;
            }

            _logger.Info("Enriching {0} episode images from TPDB", toEnrich.Count);

            for (var i = 0; i < toEnrich.Count; i++)
            {
                var episode = toEnrich[i];

                try
                {
                    _logger.Trace("TPDB image enrichment {0}/{1}: scene {2}", i + 1, toEnrich.Count, episode.TvdbId);

                    var url = _tpdbSceneClient.GetScreenshotUrl(episode.TvdbId);

                    if (url.IsNotNullOrWhiteSpace())
                    {
                        episode.Images.Add(new MediaCover.MediaCover(MediaCoverTypes.Screenshot, url));
                    }
                }
                catch (Exception ex)
                {
                    _logger.Debug(ex, "Failed to enrich episode image from TPDB for scene {0}", episode.TvdbId);
                }
            }
        }

        private static bool HasScreenshot(Episode episode)
        {
            return episode.Images?.Any(i => i.CoverType == MediaCoverTypes.Screenshot && i.RemoteUrl.IsNotNullOrWhiteSpace()) == true;
        }
    }
}
