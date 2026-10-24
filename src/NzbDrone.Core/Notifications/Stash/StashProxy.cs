using NLog;
using NzbDrone.Common.Extensions;
using NzbDrone.Common.Http;
using NzbDrone.Common.Serializer;

namespace NzbDrone.Core.Notifications.Stash
{
    public class StashProxy
    {
        public const string TpdbEndpoint = "https://theporndb.net/graphql";

        private const string FindTpdbScenesQuery = @"query FindTpdbScenes($page: Int!, $perPage: Int!) {
  findScenes(
    scene_filter: {
      stash_id_endpoint: {
        endpoint: """ + TpdbEndpoint + @"""
        modifier: NOT_NULL
      }
    }
    filter: { page: $page, per_page: $perPage }
  ) {
    count
    scenes {
      id
      title
      files { path basename }
      stash_ids { endpoint stash_id }
    }
  }
}";

        private readonly IHttpClient _httpClient;
        private readonly Logger _logger;

        public StashProxy(IHttpClient httpClient, Logger logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        public void Update(StashSettings settings, string path)
        {
            var request = BuildRequest(settings);
            request.Headers.ContentType = "application/json";

            var cleanPath = path.ToJson();

            request.SetContent(new
            {
                Query = $@"mutation {{
                            metadataScan(
                            input: {{
                                scanGenerateCovers: {(settings.GenerateCovers ? "true" : "false")},
                                scanGeneratePreviews: {(settings.GeneratePreviews ? "true" : "false")},
                                scanGenerateImagePreviews: {(settings.GenerateImagePreviews ? "true" : "false")},
                                scanGenerateSprites: {(settings.GenerateSprites ? "true" : "false")},
                                scanGeneratePhashes: {(settings.GeneratePhashes ? "true" : "false")},
                                paths: [{cleanPath}]
                            }})
                        }}"
            }.ToJson());

            ProcessRequest(request, settings);

            if (!settings.MetadataIdentify)
            {
                return;
            }

            var identifyRequest = BuildRequest(settings);
            identifyRequest.Headers.ContentType = "application/json";
            identifyRequest.SetContent(new
            {
                Query = $@"mutation {{
                            metadataIdentify(
                                input: {{
                                    sources: [
                                        {{source: {{stash_box_endpoint:""https://theporndb.net/graphql""}} }},
                                        {{source: {{scraper_id: ""builtin_autotag""}}, options: {{setOrganized: false}} }}
                                    ],
                                    options: {{
                                        includeMalePerformers: {(settings.IncludeMalePerformers ? "true" : "false")},
                                        setCoverImage: true,
                                        setOrganized: {(settings.SetOrganized ? "true" : "false")},
                                        fieldOptions: [
                                            {{ field: ""studio"", strategy: MERGE, createMissing: true }},
                                            {{ field: ""performers"", strategy: MERGE, createMissing: true }},
                                            {{ field: ""tags"", strategy: MERGE, createMissing: true }}
                                        ]
                                    }},
                                    paths: [{cleanPath}]
                                }})
                        }}"
            }.ToJson());

            ProcessRequest(identifyRequest, settings);
        }

        public void GetStatus(StashSettings settings)
        {
            var request = BuildRequest(settings);
            request.Headers.ContentType = "application/json";

            request.SetContent(new
            {
                Query = "{ systemStatus { databaseSchema databasePath configPath appSchema status } }"
            }.ToJson());

            ProcessRequest(request, settings);
        }

        public StashFindScenesResult FindTpdbScenes(StashSettings settings, int page, int perPage)
        {
            var response = ExecuteQuery<StashGraphQlResponse>(settings, FindTpdbScenesQuery, new { page, perPage });

            return response?.Data?.FindScenes;
        }

        private T ExecuteQuery<T>(StashSettings settings, string query, object variables)
            where T : new()
        {
            var request = BuildRequest(settings);
            request.Headers.ContentType = "application/json";

            request.SetContent(new
            {
                Query = query,
                Variables = variables
            }.ToJson());

            var content = ProcessRequest(request, settings);

            return Json.Deserialize<T>(content);
        }

        private string ProcessRequest(HttpRequest request, StashSettings settings)
        {
            if (settings.ApiKey.IsNotNullOrWhiteSpace())
            {
                request.Headers.Add("ApiKey", settings.ApiKey);
            }

            var response = _httpClient.Post(request);
            _logger.Trace("Response: {0}", response.Content);

            CheckForError(response);

            return response.Content;
        }

        private HttpRequest BuildRequest(StashSettings settings)
        {
            var scheme = settings.UseSsl ? "https" : "http";
            var url = $@"{scheme}://{settings.Address}/graphql";

            return new HttpRequestBuilder(url).Build();
        }

        private void CheckForError(HttpResponse response)
        {
            _logger.Debug("Looking for error in response: {0}", response);

            // TODO: actually check for the error
        }
    }
}
