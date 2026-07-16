using System;
using System.Threading.Tasks;
using NLog;
using NzbDrone.Core.Indexers;
using NzbDrone.Core.Parser.Model;

namespace NzbDrone.Core.SiteRip
{
    public interface ISiteRipMatchOrchestrator
    {
        Task RunAsync(string matchId, int seriesId, RemoteEpisode remoteEpisode, IIndexer indexer);
    }

    public class SiteRipMatchOrchestrator : ISiteRipMatchOrchestrator
    {
        private readonly ITorrentMetadataService _torrentMetadataService;
        private readonly ISiteRipMatchingService _siteRipMatchingService;
        private readonly ISiteRipMatchProgressService _matchProgressService;
        private readonly Logger _logger;

        public SiteRipMatchOrchestrator(ITorrentMetadataService torrentMetadataService,
                                        ISiteRipMatchingService siteRipMatchingService,
                                        ISiteRipMatchProgressService matchProgressService,
                                        Logger logger)
        {
            _torrentMetadataService = torrentMetadataService;
            _siteRipMatchingService = siteRipMatchingService;
            _matchProgressService = matchProgressService;
            _logger = logger;
        }

        public async Task RunAsync(string matchId, int seriesId, RemoteEpisode remoteEpisode, IIndexer indexer)
        {
            try
            {
                _matchProgressService.Start(matchId);
                _matchProgressService.ReportFetchingMetadata(matchId);

                var torrentFiles = await _torrentMetadataService.GetVideoFiles(remoteEpisode, indexer);

                _matchProgressService.ReportParsingFiles(matchId, torrentFiles.Count);

                var matches = _siteRipMatchingService.MatchFiles(seriesId, torrentFiles, matchId);

                _matchProgressService.Complete(matchId, torrentFiles, matches);
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "SiteRIP match failed: " + ex.Message);
                _matchProgressService.Fail(matchId, ex.Message);
            }
        }
    }
}
