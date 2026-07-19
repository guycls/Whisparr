using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using NzbDrone.Core.CustomFormats;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.DecisionEngine.Specifications;
using NzbDrone.Core.MediaCover;
using NzbDrone.Core.Tv;
using NzbDrone.SignalR;
using Whisparr.Http;
using Whisparr.Http.Extensions;
using Whisparr.Http.REST;
using Whisparr.Http.REST.Attributes;

namespace Whisparr.Api.V3.Episodes
{
    [V3ApiController]
    public class EpisodeController : EpisodeControllerWithSignalR
    {
        private static readonly HashSet<string> AllowedSortKeys = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "episodes.airDateUtc",
            "episodes.releaseDate",
            "episodes.title",
            "episodes.runtime",
            "episodes.seasonNumber"
        };

        public EpisodeController(ISeriesService seriesService,
                             IEpisodeService episodeService,
                             IUpgradableSpecification upgradableSpecification,
                             ICustomFormatCalculationService formatCalculator,
                             IMediaCoverProxy mediaCoverProxy,
                             IBroadcastSignalRMessage signalRBroadcaster)
            : base(episodeService, seriesService, upgradableSpecification, formatCalculator, mediaCoverProxy, signalRBroadcaster)
        {
        }

        [HttpGet]
        [Produces("application/json")]
        public List<EpisodeResource> GetEpisodes(int? seriesId, int? seasonNumber, [FromQuery]List<int> episodeIds, int? episodeFileId, bool includeSeries = false, bool includeEpisodeFile = false, bool includeImages = false)
        {
            if (seriesId.HasValue)
            {
                if (seasonNumber.HasValue)
                {
                    return MapToResource(_episodeService.GetEpisodesBySeason(seriesId.Value, seasonNumber.Value), includeSeries, includeEpisodeFile, includeImages);
                }

                return MapToResource(_episodeService.GetEpisodeBySeries(seriesId.Value), includeSeries, includeEpisodeFile, includeImages);
            }
            else if (episodeIds.Any())
            {
                return MapToResource(_episodeService.GetEpisodes(episodeIds), includeSeries, includeEpisodeFile, includeImages);
            }
            else if (episodeFileId.HasValue)
            {
                return MapToResource(_episodeService.GetEpisodesByFileId(episodeFileId.Value), includeSeries, includeEpisodeFile, includeImages);
            }

            throw new BadRequestException("seriesId or episodeIds must be provided");
        }

        [HttpGet("paged")]
        [Produces("application/json")]
        public PagingResource<EpisodeResource> GetEpisodesPaged([FromQuery] EpisodePagedRequestResource request)
        {
            if (request.SeriesId <= 0)
            {
                throw new BadRequestException("seriesId must be provided");
            }

            var pagingResource = new PagingResource<EpisodeResource>(request);
            var sortKey = NormalizeSortKey(pagingResource.SortKey);
            pagingResource.SortKey = sortKey;

            var pagingSpec = pagingResource.MapToPagingSpec<EpisodeResource, Episode>(
                AllowedSortKeys,
                "episodes.airDateUtc",
                SortDirection.Descending);

            var filter = new EpisodePagedFilter
            {
                MonitorStatus = request.MonitorStatus ?? "all",
                QualityMinIndex = request.QualityMinIndex,
                QualityMaxIndex = request.QualityMaxIndex,
                RuntimeMinMinutes = request.RuntimeMinMinutes,
                RuntimeMaxMinutes = request.RuntimeMaxMinutes
            };

            return pagingSpec.ApplyToPage(
                spec => _episodeService.GetEpisodesPaged(spec, request.SeriesId, filter),
                episode => MapToResource(episode, false, false, request.IncludeImages));
        }

        [HttpGet("filterBounds")]
        [Produces("application/json")]
        public EpisodeFilterBoundsResource GetFilterBounds(int seriesId)
        {
            if (seriesId <= 0)
            {
                throw new BadRequestException("seriesId must be provided");
            }

            var maxRuntime = _episodeService.GetMaxEpisodeRuntime(seriesId);

            return new EpisodeFilterBoundsResource
            {
                MaxEpisodeRuntime = EpisodeRuntimeFilter.RoundRuntimeMax(maxRuntime)
            };
        }

        private static string NormalizeSortKey(string sortKey)
        {
            if (string.IsNullOrWhiteSpace(sortKey))
            {
                return "episodes.airDateUtc";
            }

            if (sortKey.Equals("episodes.releaseDate", StringComparison.OrdinalIgnoreCase) ||
                sortKey.Equals("releaseDate", StringComparison.OrdinalIgnoreCase))
            {
                return "episodes.airDateUtc";
            }

            if (sortKey.Equals("title", StringComparison.OrdinalIgnoreCase))
            {
                return "episodes.title";
            }

            if (sortKey.Equals("runtime", StringComparison.OrdinalIgnoreCase))
            {
                return "episodes.runtime";
            }

            if (sortKey.Equals("seasonNumber", StringComparison.OrdinalIgnoreCase))
            {
                return "episodes.seasonNumber";
            }

            return sortKey;
        }

        [RestPutById]
        [Consumes("application/json")]
        public ActionResult<EpisodeResource> SetEpisodeMonitored([FromRoute] int id, [FromBody] EpisodeResource resource)
        {
            _episodeService.SetEpisodeMonitored(id, resource.Monitored);

            resource = MapToResource(_episodeService.GetEpisode(id), false, false, false);

            return Accepted(resource);
        }

        [HttpPut("monitor")]
        [Consumes("application/json")]
        public IActionResult SetEpisodesMonitored([FromBody] EpisodesMonitoredResource resource, [FromQuery] bool includeImages = false)
        {
            if (resource.EpisodeIds.Count == 1)
            {
                _episodeService.SetEpisodeMonitored(resource.EpisodeIds.First(), resource.Monitored);
            }
            else
            {
                _episodeService.SetMonitored(resource.EpisodeIds, resource.Monitored);
            }

            var resources = MapToResource(_episodeService.GetEpisodes(resource.EpisodeIds), false, false, includeImages);

            return Accepted(resources);
        }
    }
}
