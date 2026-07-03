using NzbDrone.Common.Extensions;
using NzbDrone.Core.Configuration;
using Whisparr.Http.REST;

namespace Whisparr.Api.V3.Config
{
    public class MetadataSourceConfigResource : RestResource
    {
        public string TpdbApiKey { get; set; }
        public bool HasTpdbApiKey { get; set; }
        public bool TpdbRefetchThumbnails { get; set; }
        public bool ClearTpdbApiKey { get; set; }
    }

    public static class MetadataSourceConfigResourceMapper
    {
        public static MetadataSourceConfigResource ToResource(IConfigService model)
        {
            var hasKey = model.TpdbApiKey.IsNotNullOrWhiteSpace();

            return new MetadataSourceConfigResource
            {
                TpdbApiKey = string.Empty,
                HasTpdbApiKey = hasKey,
                TpdbRefetchThumbnails = model.TpdbRefetchThumbnails
            };
        }
    }
}
