using System;
using System.Linq;
using System.Net;
using System.Threading;
using NLog;
using NzbDrone.Common.Extensions;
using NzbDrone.Common.Http;
using NzbDrone.Common.Serializer;
using NzbDrone.Core.Configuration;

namespace NzbDrone.Core.MetadataSource.ThePornDb
{
    public class TpdbSceneClient : ITpdbSceneClient
    {
        private const string GraphQlUrl = "https://theporndb.net/graphql";
        private const string ScenesUrl = "https://api.theporndb.net/scenes";
        private const string FindSceneQuery = @"query FindSceneByID($id: ID!) {
  findScene(id: $id) {
    id
    images { url width height }
  }
}";
        private const int MaxAttempts = 4;

        private static readonly TimeSpan RetryDelay = TimeSpan.FromSeconds(5);

        private readonly IHttpClient _httpClient;
        private readonly IConfigService _configService;
        private readonly Logger _logger;

        public TpdbSceneClient(IHttpClient httpClient,
                               IConfigService configService,
                               Logger logger)
        {
            _httpClient = httpClient;
            _configService = configService;
            _logger = logger;
        }

        public string GetScreenshotUrl(int sceneId)
        {
            var scene = FindScene(sceneId);

            if (scene == null)
            {
                return null;
            }

            return ParseScreenshotUrl(scene);
        }

        public string GetSceneUuid(int sceneId)
        {
            var scene = FindScene(sceneId);

            return scene?.Id;
        }

        public TpdbSceneReference GetSceneByUuid(string sceneUuid)
        {
            var apiKey = _configService.TpdbApiKey;

            if (apiKey.IsNullOrWhiteSpace() || sceneUuid.IsNullOrWhiteSpace())
            {
                return null;
            }

            try
            {
                for (var attempt = 1; attempt <= MaxAttempts; attempt++)
                {
                    var request = new HttpRequestBuilder(ScenesUrl)
                        .Resource(sceneUuid)
                        .Accept(HttpAccept.Json)
                        .SetHeader("Authorization", FormatAuthorizationHeader(apiKey))
                        .Build();

                    request.SuppressHttpError = true;

                    var response = _httpClient.Get(request);

                    if (response.StatusCode == HttpStatusCode.Unauthorized)
                    {
                        _logger.Debug("TPDB scene lookup failed for {0}: Unauthorized", sceneUuid);
                        return null;
                    }

                    if (response.StatusCode == HttpStatusCode.TooManyRequests)
                    {
                        if (attempt < MaxAttempts)
                        {
                            var retryDelay = GetRetryDelay(response);
                            _logger.Debug("TPDB scene lookup failed for {0}: {1}, retrying in {2:0.###}s ({3}/{4})", sceneUuid, response.StatusCode, retryDelay.TotalSeconds, attempt, MaxAttempts);
                            Thread.Sleep(retryDelay);
                            continue;
                        }

                        _logger.Debug("TPDB scene lookup failed for {0}: rate limited", sceneUuid);
                        return null;
                    }

                    if (response.HasHttpError || response.Content.IsNullOrWhiteSpace())
                    {
                        _logger.Debug("TPDB scene lookup failed for {0}: {1}", sceneUuid, response.StatusCode);
                        return null;
                    }

                    var scene = ParseRestScene(response.Content);

                    if (scene == null)
                    {
                        _logger.Debug("TPDB scene lookup failed for {0}: invalid response", sceneUuid);
                        return null;
                    }

                    var sceneId = scene.NumericId;
                    var siteId = scene.SiteId > 0 ? scene.SiteId : scene.Site?.Id ?? 0;

                    if (sceneId <= 0 || siteId <= 0)
                    {
                        _logger.Debug("TPDB scene {0} did not include a scene id and site id", sceneUuid);
                        return null;
                    }

                    return new TpdbSceneReference
                    {
                        SceneId = sceneId,
                        SiteId = siteId,
                        Title = scene.Title
                    };
                }

                return null;
            }
            catch (HttpException ex)
            {
                _logger.Debug(ex, "TPDB scene lookup failed for {0}", sceneUuid);
                return null;
            }
        }

        private static TpdbRestScene ParseRestScene(string content)
        {
            if (Json.TryDeserialize<TpdbRestSceneResponse>(content, out var wrapped) && wrapped?.Data != null)
            {
                return wrapped.Data;
            }

            if (Json.TryDeserialize<TpdbRestScene>(content, out var scene))
            {
                return scene;
            }

            return null;
        }

        private TpdbScene FindScene(int sceneId)
        {
            var apiKey = _configService.TpdbApiKey;

            if (apiKey.IsNullOrWhiteSpace() || sceneId <= 0)
            {
                return null;
            }

            try
            {
                for (var attempt = 1; attempt <= MaxAttempts; attempt++)
                {
                    var request = new HttpRequestBuilder(GraphQlUrl)
                        .Post()
                        .Accept(HttpAccept.Json)
                        .SetHeader("Authorization", FormatAuthorizationHeader(apiKey))
                        .Build();

                    request.Headers.ContentType = "application/json";
                    request.SuppressHttpError = true;

                    request.SetContent(new
                    {
                        Query = FindSceneQuery,
                        Variables = new { id = sceneId.ToString() }
                    }.ToJson());

                    var response = _httpClient.Post<TpdbGraphQlResponse>(request);

                    if (IsUnauthorized(response))
                    {
                        _logger.Debug("TPDB scene lookup failed for {0}: Unauthorized", sceneId);
                        return null;
                    }

                    if (response.StatusCode == HttpStatusCode.TooManyRequests ||
                        HasRateLimitError(response.Resource))
                    {
                        if (attempt < MaxAttempts)
                        {
                            var retryDelay = GetRetryDelay(response);
                            _logger.Debug("TPDB scene lookup failed for {0}: {1}, retrying in {2:0.###}s ({3}/{4})", sceneId, response.StatusCode, retryDelay.TotalSeconds, attempt, MaxAttempts);
                            Thread.Sleep(retryDelay);
                            continue;
                        }

                        _logger.Debug("TPDB scene lookup failed for {0}: rate limited", sceneId);
                        return null;
                    }

                    if (response.HasHttpError)
                    {
                        _logger.Debug("TPDB scene lookup failed for {0}: {1}", sceneId, response.StatusCode);
                        return null;
                    }

                    var scene = response.Resource?.Data?.FindScene;

                    if (scene == null)
                    {
                        _logger.Debug("TPDB scene {0} not found", sceneId);
                        return null;
                    }

                    return scene;
                }

                return null;
            }
            catch (HttpException ex)
            {
                _logger.Debug(ex, "TPDB scene lookup failed for {0}", sceneId);
                return null;
            }
        }

        private static string FormatAuthorizationHeader(string apiKey)
        {
            if (apiKey.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            {
                return apiKey;
            }

            return "Bearer " + apiKey;
        }

        private static bool IsUnauthorized(HttpResponse<TpdbGraphQlResponse> response)
        {
            if (response.StatusCode == HttpStatusCode.Unauthorized)
            {
                return true;
            }

            return response.Resource?.Errors?.Any(e =>
                e.Message != null &&
                e.Message.IndexOf("Unauthenticated", StringComparison.OrdinalIgnoreCase) >= 0) == true;
        }

        private static bool HasRateLimitError(TpdbGraphQlResponse resource)
        {
            return resource?.Errors?.Any(e =>
                e.Message != null &&
                e.Message.IndexOf("Too Many Attempts", StringComparison.OrdinalIgnoreCase) >= 0) == true;
        }

        private static TimeSpan GetRetryDelay(HttpResponse response)
        {
            if (!response.Headers.ContainsKey("Retry-After"))
            {
                return RetryDelay;
            }

            var retryAfter = response.Headers.GetSingleValue("Retry-After");

            if (retryAfter.IsNullOrWhiteSpace())
            {
                return RetryDelay;
            }

            if (int.TryParse(retryAfter, out var seconds) && seconds >= 0)
            {
                return TimeSpan.FromSeconds(seconds);
            }

            if (DateTime.TryParse(retryAfter, out var date))
            {
                var delay = date.ToUniversalTime() - DateTime.UtcNow;

                if (delay > TimeSpan.Zero)
                {
                    return delay;
                }
            }

            return RetryDelay;
        }

        private static string ParseScreenshotUrl(TpdbScene scene)
        {
            if (scene?.Images == null || !scene.Images.Any())
            {
                return null;
            }

            var portrait = scene.Images.FirstOrDefault(i =>
                i.Url.IsNotNullOrWhiteSpace() && i.Height >= i.Width);

            if (portrait != null)
            {
                return portrait.Url;
            }

            return scene.Images.FirstOrDefault(i => i.Url.IsNotNullOrWhiteSpace())?.Url;
        }
    }
}
