using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.CustomFormats;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.DecisionEngine.Specifications;
using NzbDrone.Core.Download;
using NzbDrone.Core.History;
using NzbDrone.Core.MediaFiles;
using NzbDrone.Core.Qualities;
using NzbDrone.Core.Tv;
using Whisparr.Api.V3.Episodes;
using Whisparr.Api.V3.Series;
using Whisparr.Http;
using Whisparr.Http.Extensions;

namespace Whisparr.Api.V3.History
{
    [V3ApiController]
    public class HistoryController : Controller
    {
        private readonly IHistoryService _historyService;
        private readonly ICustomFormatCalculationService _formatCalculator;
        private readonly IUpgradableSpecification _upgradableSpecification;
        private readonly IFailedDownloadService _failedDownloadService;
        private readonly ISeriesService _seriesService;
        private readonly IEpisodeFileHardLinkRepository _hardLinkRepository;
        private readonly IMediaFileService _mediaFileService;

        public HistoryController(IHistoryService historyService,
                             ICustomFormatCalculationService formatCalculator,
                             IUpgradableSpecification upgradableSpecification,
                             IFailedDownloadService failedDownloadService,
                             ISeriesService seriesService,
                             IEpisodeFileHardLinkRepository hardLinkRepository,
                             IMediaFileService mediaFileService)
        {
            _historyService = historyService;
            _formatCalculator = formatCalculator;
            _upgradableSpecification = upgradableSpecification;
            _failedDownloadService = failedDownloadService;
            _seriesService = seriesService;
            _hardLinkRepository = hardLinkRepository;
            _mediaFileService = mediaFileService;
        }

        protected HistoryResource MapToResource(EpisodeHistory model, bool includeSeries, bool includeEpisode, IReadOnlyDictionary<int, EpisodeFile> filesById = null)
        {
            var resource = model.ToResource(_formatCalculator);

            if (includeSeries)
            {
                resource.Series = model.Series.ToResource();
            }

            if (includeEpisode)
            {
                resource.Episode = model.Episode.ToResource();
            }

            if (filesById != null &&
                QualityIsUnknown(resource.Quality) &&
                TryGetFileId(resource, out var fileId) &&
                filesById.TryGetValue(fileId, out var file) &&
                !QualityIsUnknown(file.Quality))
            {
                resource.Quality = file.Quality;
            }

            if (model.Series != null)
            {
                resource.QualityCutoffNotMet = _upgradableSpecification.QualityCutoffNotMet(model.Series.QualityProfile.Value, resource.Quality);
            }

            return resource;
        }

        [HttpGet]
        [Produces("application/json")]
        public PagingResource<HistoryResource> GetHistory([FromQuery] PagingRequestResource paging, bool includeSeries, bool includeEpisode, [FromQuery(Name = "eventType")] int[] eventTypes, int? episodeId, string downloadId, [FromQuery] int[] seriesIds = null, [FromQuery] int[] languages = null, [FromQuery] int[] quality = null)
        {
            var pagingResource = new PagingResource<HistoryResource>(paging);
            var pagingSpec = pagingResource.MapToPagingSpec<HistoryResource, EpisodeHistory>(
                new HashSet<string>(StringComparer.OrdinalIgnoreCase)
                {
                    "date",
                    "series.sortTitle"
                },
                "date",
                SortDirection.Descending);

            if (eventTypes != null && eventTypes.Any())
            {
                pagingSpec.FilterExpressions.Add(v => eventTypes.Contains((int)v.EventType));
            }

            if (episodeId.HasValue)
            {
                pagingSpec.FilterExpressions.Add(h => h.EpisodeId == episodeId);
            }

            if (downloadId.IsNotNullOrWhiteSpace())
            {
                pagingSpec.FilterExpressions.Add(h => h.DownloadId == downloadId);
            }

            if (seriesIds != null && seriesIds.Any())
            {
                pagingSpec.FilterExpressions.Add(h => seriesIds.Contains(h.SeriesId));
            }

            IReadOnlyDictionary<int, EpisodeFile> filesById = null;
            var page = pagingSpec.ApplyToPage(
                spec =>
                {
                    var result = _historyService.Paged(spec, languages, quality);
                    filesById = GetFilesForUnknownHistory(result.Records);
                    return result;
                },
                history => MapToResource(history, includeSeries, includeEpisode, filesById));
            AttachHardLinks(page.Records);

            return page;
        }

        [HttpGet("since")]
        [Produces("application/json")]
        public List<HistoryResource> GetHistorySince(DateTime date, EpisodeHistoryEventType? eventType = null, bool includeSeries = false, bool includeEpisode = false)
        {
            var history = _historyService.Since(date, eventType).ToList();
            var filesById = GetFilesForUnknownHistory(history);
            var resources = history.Select(h => MapToResource(h, includeSeries, includeEpisode, filesById)).ToList();
            AttachHardLinks(resources);

            return resources;
        }

        [HttpGet("series")]
        [Produces("application/json")]
        public List<HistoryResource> GetSeriesHistory(int seriesId, int? seasonNumber, EpisodeHistoryEventType? eventType = null, bool includeSeries = false, bool includeEpisode = false)
        {
            var series = _seriesService.GetSeries(seriesId);

            var history = seasonNumber.HasValue ?
                _historyService.GetBySeason(seriesId, seasonNumber.Value, eventType) :
                _historyService.GetBySeries(seriesId, eventType);

            var filesById = GetFilesForUnknownHistory(history);

            var resources = history.Select(h =>
            {
                h.Series = series;

                return MapToResource(h, includeSeries, includeEpisode, filesById);
            }).ToList();

            AttachHardLinks(resources);

            return resources;
        }

        [HttpPost("failed/{id}")]
        public object MarkAsFailed([FromRoute] int id)
        {
            _failedDownloadService.MarkAsFailed(id);
            return new { };
        }

        private void AttachHardLinks(List<HistoryResource> resources)
        {
            if (resources == null || resources.Count == 0)
            {
                return;
            }

            var fileIds = new List<int>();

            foreach (var resource in resources)
            {
                if (TryGetFileId(resource, out var fileId))
                {
                    fileIds.Add(fileId);
                }
            }

            if (fileIds.Count == 0)
            {
                return;
            }

            var linksByFileId = _hardLinkRepository.GetByEpisodeFileIds(fileIds.Distinct().ToList())
                .GroupBy(link => link.EpisodeFileId)
                .ToDictionary(group => group.Key, group => group.Select(link => link.Path).ToList());

            foreach (var resource in resources)
            {
                if (TryGetFileId(resource, out var fileId) && linksByFileId.TryGetValue(fileId, out var paths))
                {
                    resource.HardLinks = paths;
                }
            }
        }

        private static bool TryGetFileId(HistoryResource resource, out int fileId)
        {
            fileId = 0;

            if (resource?.Data == null)
            {
                return false;
            }

            if (!resource.Data.TryGetValue("FileId", out var value) &&
                !resource.Data.TryGetValue("fileId", out value))
            {
                return false;
            }

            return int.TryParse(value, out fileId) && fileId > 0;
        }

        private IReadOnlyDictionary<int, EpisodeFile> GetFilesForUnknownHistory(IEnumerable<EpisodeHistory> history)
        {
            var fileIds = new List<int>();

            foreach (var item in history ?? Enumerable.Empty<EpisodeHistory>())
            {
                if (item == null || !QualityIsUnknown(item.Quality))
                {
                    continue;
                }

                if (TryGetFileId(item.Data, out var fileId))
                {
                    fileIds.Add(fileId);
                }
            }

            if (fileIds.Count == 0)
            {
                return new Dictionary<int, EpisodeFile>();
            }

            return _mediaFileService.FindFiles(fileIds)
                .Where(file => !QualityIsUnknown(file.Quality))
                .ToDictionary(file => file.Id);
        }

        private static bool TryGetFileId(IDictionary<string, string> data, out int fileId)
        {
            fileId = 0;

            if (data == null)
            {
                return false;
            }

            if (!data.TryGetValue("FileId", out var value) &&
                !data.TryGetValue("fileId", out value))
            {
                return false;
            }

            return int.TryParse(value, out fileId) && fileId > 0;
        }

        private static bool QualityIsUnknown(QualityModel quality)
        {
            return quality == null || quality.Quality == null || quality.Quality == Quality.Unknown;
        }
    }
}
