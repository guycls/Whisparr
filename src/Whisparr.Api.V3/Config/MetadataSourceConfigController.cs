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
            if (resource.TpdbApiKey.IsNotNullOrWhiteSpace())
            {
                _configService.TpdbApiKey = resource.TpdbApiKey;
            }

            return Accepted(resource.Id);
        }

        protected override MetadataSourceConfigResource ToResource(IConfigService model)
        {
            return MetadataSourceConfigResourceMapper.ToResource(model);
        }
    }
}
