using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using NLog;
using NzbDrone.Common.Cache;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.DecisionEngine;
using NzbDrone.Core.Exceptions;
using NzbDrone.Core.Indexers;
using NzbDrone.Core.IndexerSearch;
using NzbDrone.Core.Parser.Model;
using NzbDrone.Core.Profiles.Qualities;
using NzbDrone.Core.SiteRip;
using Whisparr.Api.V3.Indexers;
using Whisparr.Http;
using HttpStatusCode = System.Net.HttpStatusCode;

namespace Whisparr.Api.V3.SiteRip
{
    [V3ApiController]
    public class SiteRipController : ReleaseControllerBase
    {
        private readonly ISearchForReleases _releaseSearchService;
        private readonly IPrioritizeDownloadDecision _prioritizeDownloadDecision;
        private readonly ISearchProgressService _searchProgressService;
        private readonly ITorrentMetadataService _torrentMetadataService;
        private readonly ISiteRipMatchingService _siteRipMatchingService;
        private readonly ISiteRipDownloadService _siteRipDownloadService;
        private readonly IIndexerFactory _indexerFactory;
        private readonly Logger _logger;

        private readonly ICached<RemoteEpisode> _remoteEpisodeCache;

        public SiteRipController(ISearchForReleases releaseSearchService,
                                 IPrioritizeDownloadDecision prioritizeDownloadDecision,
                                 ISearchProgressService searchProgressService,
                                 ITorrentMetadataService torrentMetadataService,
                                 ISiteRipMatchingService siteRipMatchingService,
                                 ISiteRipDownloadService siteRipDownloadService,
                                 IIndexerFactory indexerFactory,
                                 ICacheManager cacheManager,
                                 IQualityProfileService qualityProfileService,
                                 Logger logger)
            : base(qualityProfileService)
        {
            _releaseSearchService = releaseSearchService;
            _prioritizeDownloadDecision = prioritizeDownloadDecision;
            _searchProgressService = searchProgressService;
            _torrentMetadataService = torrentMetadataService;
            _siteRipMatchingService = siteRipMatchingService;
            _siteRipDownloadService = siteRipDownloadService;
            _indexerFactory = indexerFactory;
            _logger = logger;

            _remoteEpisodeCache = cacheManager.GetCache<RemoteEpisode>(GetType(), "remoteEpisodes");
        }

        [HttpGet("search")]
        public async Task<List<ReleaseResource>> Search([FromQuery] int seriesId, [FromQuery] string searchId)
        {
            try
            {
                var decisions = await _releaseSearchService.SiteRipSearch(seriesId, true, true, searchId);
                var prioritizedDecisions = _prioritizeDownloadDecision.PrioritizeDecisions(decisions);

                return MapDecisions(prioritizedDecisions);
            }
            catch (SearchFailedException ex)
            {
                if (searchId.IsNotNullOrWhiteSpace())
                {
                    _searchProgressService.Fail(searchId, ex.Message);
                }

                throw new NzbDroneClientException(HttpStatusCode.BadRequest, ex.Message);
            }
            catch (Exception ex)
            {
                if (searchId.IsNotNullOrWhiteSpace())
                {
                    _searchProgressService.Fail(searchId, ex.Message);
                }

                _logger.Error(ex, "SiteRIP search failed: " + ex.Message);
                throw new NzbDroneClientException(HttpStatusCode.InternalServerError, ex.Message);
            }
        }

        [HttpGet("search/progress/{searchId}")]
        public ActionResult<SearchProgressResource> GetSearchProgress(string searchId)
        {
            var progress = _searchProgressService.Get(searchId);

            if (progress == null)
            {
                return NotFound();
            }

            return SearchProgressResourceMapper.ToResource(progress);
        }

        [HttpGet("torrent/files")]
        public async Task<List<SiteRipTorrentFileResource>> GetTorrentFiles([FromQuery] string guid, [FromQuery] int indexerId)
        {
            var remoteEpisode = GetCachedRelease(guid, indexerId);
            var indexer = _indexerFactory.GetInstance(_indexerFactory.Get(indexerId));
            var files = await _torrentMetadataService.GetVideoFiles(remoteEpisode, indexer);

            return files.Select(f => new SiteRipTorrentFileResource
            {
                Index = f.Index,
                Path = f.Path,
                Name = f.Name,
                Size = f.Size
            }).ToList();
        }

        [HttpPost("match")]
        public ActionResult<List<SiteRipMatchResource>> Match([FromBody] SiteRipMatchRequestResource request)
        {
            var files = request.Files.Select(f => new TorrentFileMetadata
            {
                Index = f.Index,
                Path = f.Path,
                Name = f.Name,
                Size = f.Size
            }).ToList();

            var matches = _siteRipMatchingService.MatchFiles(request.SeriesId, files);

            return matches.Select(m => new SiteRipMatchResource
            {
                FileIndices = m.FileIndices,
                FilePaths = m.FilePaths,
                TotalSize = m.TotalSize,
                PartNumber = m.PartNumber,
                PartTotal = m.PartTotal,
                MatchedEpisodeId = m.MatchedEpisodeId,
                MatchConfidence = m.MatchConfidence,
                SelectedByDefault = m.SelectedByDefault,
                DisplayName = m.DisplayName
            }).ToList();
        }

        [HttpPost("grab")]
        public async Task<IActionResult> Grab([FromBody] SiteRipGrabResource request)
        {
            try
            {
                _siteRipDownloadService.GetQBittorrentClient();
            }
            catch (SiteRipException ex)
            {
                throw new NzbDroneClientException(HttpStatusCode.Conflict, ex.Message);
            }

            var remoteEpisode = GetCachedRelease(request.Guid, request.IndexerId);

            var selections = request.Selections.Select(s => new SiteRipGrabSelection
            {
                EpisodeId = s.EpisodeId,
                FileIndices = s.FileIndices,
                FilePaths = s.FilePaths ?? new List<string>()
            }).ToList();

            await _siteRipDownloadService.Grab(remoteEpisode, request.SeriesId, selections);

            return Accepted();
        }

        protected override ReleaseResource MapDecision(DownloadDecision decision, int initialWeight)
        {
            var resource = base.MapDecision(decision, initialWeight);
            _remoteEpisodeCache.Set(GetCacheKey(resource), decision.RemoteEpisode, TimeSpan.FromMinutes(30));

            return resource;
        }

        private RemoteEpisode GetCachedRelease(string guid, int indexerId)
        {
            var remoteEpisode = _remoteEpisodeCache.Find($"{indexerId}_{guid}");

            if (remoteEpisode == null)
            {
                throw new NzbDroneClientException(HttpStatusCode.NotFound, "Couldn't find requested release in cache, try searching again");
            }

            return remoteEpisode;
        }

        private static string GetCacheKey(ReleaseResource resource)
        {
            return string.Concat(resource.IndexerId, "_", resource.Guid);
        }
    }
}
