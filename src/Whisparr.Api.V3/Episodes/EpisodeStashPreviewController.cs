using Microsoft.AspNetCore.Mvc;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.Notifications.Stash;
using Whisparr.Http;

namespace Whisparr.Api.V3.Episodes
{
    [V3ApiController("episode")]
    public class EpisodeStashPreviewController : Controller
    {
        private readonly IStashPreviewService _stashPreviewService;

        public EpisodeStashPreviewController(IStashPreviewService stashPreviewService)
        {
            _stashPreviewService = stashPreviewService;
        }

        [HttpGet("{id:int}/stashPreview")]
        public IActionResult GetStashPreview(int id)
        {
            var path = _stashPreviewService.GetPreviewPath(id);

            if (path.IsNullOrWhiteSpace())
            {
                return NotFound();
            }

            return PhysicalFile(path, "video/mp4", enableRangeProcessing: true);
        }
    }
}
