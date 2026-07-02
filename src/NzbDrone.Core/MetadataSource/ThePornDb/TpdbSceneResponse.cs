using System.Collections.Generic;

namespace NzbDrone.Core.MetadataSource.ThePornDb
{
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
