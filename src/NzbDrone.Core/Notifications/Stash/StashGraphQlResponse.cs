using System.Collections.Generic;
using Newtonsoft.Json;

namespace NzbDrone.Core.Notifications.Stash
{
    public class StashGraphQlResponse
    {
        public StashGraphQlData Data { get; set; }
        public List<StashGraphQlError> Errors { get; set; }
    }

    public class StashGraphQlData
    {
        public StashFindScenesResult FindScenes { get; set; }
    }

    public class StashGraphQlError
    {
        public string Message { get; set; }
    }

    public class StashFindScenesResult
    {
        public int Count { get; set; }
        public List<StashScene> Scenes { get; set; }
    }

    public class StashScene
    {
        public string Id { get; set; }
        public string Title { get; set; }
        public List<StashSceneFile> Files { get; set; }

        [JsonProperty("stash_ids")]
        public List<StashSceneStashId> StashIds { get; set; }
    }

    public class StashSceneFile
    {
        public string Path { get; set; }
        public string Basename { get; set; }
    }

    public class StashSceneStashId
    {
        public string Endpoint { get; set; }

        [JsonProperty("stash_id")]
        public string StashId { get; set; }
    }
}
