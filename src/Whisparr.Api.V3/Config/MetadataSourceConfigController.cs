using Microsoft.AspNetCore.Mvc;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.Configuration;
using Whisparr.Http;
using Whisparr.Http.REST.Attributes;

namespace Whisparr.Api.V3.Config
{
    [V3ApiController("config/metadatasource")]
    public class MetadataSourceConfigController : ConfigController<MetadataSourceConfigResource>
    {
        public MetadataSourceConfigController(IConfigService configService)
            : base(configService)
        {
        }

        [RestPutById]
        public override ActionResult<MetadataSourceConfigResource> SaveConfig([FromBody] MetadataSourceConfigResource resource)
        {
            if (resource.ClearTpdbApiKey)
            {
                _configService.TpdbApiKey = string.Empty;
            }
            else if (resource.TpdbApiKey.IsNotNullOrWhiteSpace())
            {
                _configService.TpdbApiKey = resource.TpdbApiKey;
            }

            _configService.TpdbRefetchThumbnails = resource.TpdbRefetchThumbnails;

            var saved = ToResource(_configService);
            saved.Id = resource.Id;

            return Accepted(saved);
        }

        protected override MetadataSourceConfigResource ToResource(IConfigService model)
        {
            return MetadataSourceConfigResourceMapper.ToResource(model);
        }
    }
}
