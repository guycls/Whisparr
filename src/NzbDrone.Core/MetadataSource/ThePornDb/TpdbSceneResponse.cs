using System.Collections.Generic;
using Newtonsoft.Json;

namespace NzbDrone.Core.MetadataSource.ThePornDb
{
    public class TpdbSceneReference
    {
        public int SceneId { get; set; }
        public int SiteId { get; set; }
        public string Title { get; set; }
    }

    public class TpdbRestSceneResponse
    {
        public TpdbRestScene Data { get; set; }
    }

    public class TpdbRestScene
    {
        public string Id { get; set; }

        [JsonProperty("_id")]
        public int NumericId { get; set; }

        [JsonProperty("site_id")]
        public int SiteId { get; set; }

        public string Title { get; set; }
        public TpdbRestSite Site { get; set; }
    }

    public class TpdbRestSite
    {
        public int Id { get; set; }
        public string Name { get; set; }
    }

    public class TpdbGraphQlResponse
    {
        public TpdbGraphQlData Data { get; set; }
        public List<TpdbGraphQlError> Errors { get; set; }
    }

    public class TpdbGraphQlData
    {
        public TpdbScene FindScene { get; set; }
    }

    public class TpdbGraphQlError
    {
        public string Message { get; set; }
    }

    public class TpdbScene
    {
        public string Id { get; set; }
        public List<TpdbImage> Images { get; set; }
    }

    public class TpdbImage
    {
        public string Id { get; set; }
        public string Url { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }
    }
}
