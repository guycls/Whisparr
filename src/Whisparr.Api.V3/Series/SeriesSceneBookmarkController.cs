using System;
using Microsoft.AspNetCore.Mvc;
using NzbDrone.Core.Tv;
using Whisparr.Http;
using Whisparr.Http.REST;

namespace Whisparr.Api.V3.Series
{
    [V3ApiController("series")]
    public class SeriesSceneBookmarkController : Controller
    {
        private readonly ISeriesSceneBookmarkService _seriesSceneBookmarkService;

        public SeriesSceneBookmarkController(ISeriesSceneBookmarkService seriesSceneBookmarkService)
        {
            _seriesSceneBookmarkService = seriesSceneBookmarkService;
        }

        [HttpGet("{seriesId:int}/scenebookmark")]
        [Produces("application/json")]
        public SeriesSceneBookmarkResource GetSceneBookmarks(int seriesId)
        {
            return _seriesSceneBookmarkService.Get(seriesId).ToResource();
        }

        [HttpPost("{seriesId:int}/scenebookmark")]
        [Consumes("application/json")]
        [Produces("application/json")]
        public ActionResult<SeriesSceneBookmarkResource> ToggleSceneBookmark(int seriesId, [FromBody] SeriesSceneBookmarkToggleResource resource)
        {
            if (resource == null)
            {
                throw new BadRequestException("Request body is required");
            }

            try
            {
                return _seriesSceneBookmarkService.Toggle(seriesId, resource.SortKey, resource.SortDirection, resource.EpisodeId).ToResource();
            }
            catch (ArgumentException ex)
            {
                throw new BadRequestException(ex.Message);
            }
        }
    }
}
