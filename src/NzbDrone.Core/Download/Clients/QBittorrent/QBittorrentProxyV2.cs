using System;
using System.Collections.Generic;
using System.Net;
using NLog;
using NzbDrone.Common.Cache;
using NzbDrone.Common.Extensions;
using NzbDrone.Common.Http;
using NzbDrone.Common.Serializer;

namespace NzbDrone.Core.Download.Clients.QBittorrent
{
    // API https://github.com/qbittorrent/qBittorrent/wiki/Web-API-Documentation

    public class QBittorrentProxyV2 : IQBittorrentProxy
    {
        private readonly IHttpClient _httpClient;
        private readonly Logger _logger;
        private readonly ICached<Dictionary<string, string>> _authCookieCache;
        private readonly ICached<bool> _isQBitTorrent5Cache;

        public QBittorrentProxyV2(IHttpClient httpClient, ICacheManager cacheManager, Logger logger)
        {
            _httpClient = httpClient;
            _logger = logger;

            _authCookieCache = cacheManager.GetCache<Dictionary<string, string>>(GetType(), "authCookies");
            _isQBitTorrent5Cache = cacheManager.GetCache<bool>(GetType(), "isQBitTorrent5");
        }

        public bool IsApiSupported(QBittorrentSettings settings)
        {
            // We can do the api test without having to authenticate since v3.2.0-v4.0.4 will return 404 on the request.
            var request = BuildRequest(settings).Resource("/api/v2/app/webapiVersion");
            request.SuppressHttpError = true;

            try
            {
                var response = _httpClient.Execute(request.Build());

                // Version request will return 404 if it doesn't exist.
                if (response.StatusCode == HttpStatusCode.NotFound)
                {
                    return false;
                }

                if (response.StatusCode == HttpStatusCode.Forbidden)
                {
                    return true;
                }

                if (response.StatusCode == HttpStatusCode.Unauthorized)
                {
                    throw new DownloadClientException("Failed to connect to qBittorrent. Check your settings and qBittorrent configuration.", new HttpException(response));
                }

                if (response.HasHttpError)
                {
                    throw new DownloadClientException("Failed to connect to qBittorrent, check your settings.", new HttpException(response));
                }

                return true;
            }
            catch (WebException ex)
            {
                if (ex.Status == WebExceptionStatus.TrustFailure)
                {
                    throw new DownloadClientUnavailableException("Unable to connect to qBittorrent, certificate validation failed.", ex);
                }

                throw new DownloadClientException("Failed to connect to qBittorrent, check your settings.", ex);
            }
        }

        public Version GetApiVersion(QBittorrentSettings settings)
        {
            var request = BuildRequest(settings).Resource("/api/v2/app/webapiVersion");
            var response = Version.Parse(ProcessRequest(request, settings));

            return response;
        }

        public string GetVersion(QBittorrentSettings settings)
        {
            var request = BuildRequest(settings).Resource("/api/v2/app/version");
            var response = ProcessRequest(request, settings).TrimStart('v');

            // eg "4.2alpha"
            return response;
        }

        public QBittorrentPreferences GetConfig(QBittorrentSettings settings)
        {
            var request = BuildRequest(settings).Resource("/api/v2/app/preferences");
            var response = ProcessRequest<QBittorrentPreferences>(request, settings);

            return response;
        }

        public List<QBittorrentTorrent> GetTorrents(QBittorrentSettings settings)
        {
            var request = BuildRequest(settings).Resource("/api/v2/torrents/info");
            if (settings.TvCategory.IsNotNullOrWhiteSpace())
            {
                request.AddQueryParam("category", settings.TvCategory);
            }

            var response = ProcessRequest<List<QBittorrentTorrent>>(request, settings);

            return response;
        }

        public bool IsTorrentLoaded(string hash, QBittorrentSettings settings)
        {
            var request = BuildRequest(settings).Resource("/api/v2/torrents/properties")
                                                .AddQueryParam("hash", hash);
            request.LogHttpError = false;

            try
            {
                ProcessRequest(request, settings);

                return true;
            }
            catch
            {
                return false;
            }
        }

        public QBittorrentTorrentProperties GetTorrentProperties(string hash, QBittorrentSettings settings)
        {
            var request = BuildRequest(settings).Resource("/api/v2/torrents/properties")
                                                .AddQueryParam("hash", hash);
            var response = ProcessRequest<QBittorrentTorrentProperties>(request, settings);

            return response;
        }

        public List<QBittorrentTorrentFile> GetTorrentFiles(string hash, QBittorrentSettings settings)
        {
            var request = BuildRequest(settings).Resource("/api/v2/torrents/files")
                                                .AddQueryParam("hash", hash);
            var response = ProcessRequest<List<QBittorrentTorrentFile>>(request, settings);

            return response;
        }

        public void AddTorrentFromUrl(string torrentUrl, TorrentSeedConfiguration seedConfiguration, QBittorrentSettings settings)
        {
            AddTorrentFromUrl(torrentUrl, seedConfiguration, settings, (QBittorrentState)settings.InitialState == QBittorrentState.Pause);
        }

        public void AddTorrentFromFile(string fileName, byte[] fileContent, TorrentSeedConfiguration seedConfiguration, QBittorrentSettings settings)
        {
            AddTorrentFromFile(fileName, fileContent, seedConfiguration, settings, (QBittorrentState)settings.InitialState == QBittorrentState.Pause);
        }

        public void AddTorrentFromUrl(string torrentUrl, TorrentSeedConfiguration seedConfiguration, QBittorrentSettings settings, bool paused)
        {
            var request = BuildRequest(settings).Resource("/api/v2/torrents/add")
                                                .Post()
                                                .AddFormParameter("urls", torrentUrl);

            AddTorrentDownloadFormParameters(request, settings, paused);

            if (seedConfiguration != null)
            {
                AddTorrentSeedingFormParameters(request, seedConfiguration);
            }

            var result = ProcessRequest(request, settings);

            if (result == "Fails.")
            {
                throw new DownloadClientException("Download client failed to add torrent by url");
            }
        }

        public void AddTorrentFromFile(string fileName, byte[] fileContent, TorrentSeedConfiguration seedConfiguration, QBittorrentSettings settings, bool paused)
        {
            var request = BuildRequest(settings).Resource("/api/v2/torrents/add")
                                                .Post()
                                                .AddFormUpload("torrents", fileName, fileContent);

            AddTorrentDownloadFormParameters(request, settings, paused);

            if (seedConfiguration != null)
            {
                AddTorrentSeedingFormParameters(request, seedConfiguration);
            }

            var result = ProcessRequest(request, settings);

            if (result == "Fails.")
            {
                throw new DownloadClientException("Download client failed to add torrent");
            }
        }

        public void RemoveTorrent(string hash, bool removeData, QBittorrentSettings settings)
        {
            var request = BuildRequest(settings).Resource("/api/v2/torrents/delete")
                                                .Post()
                                                .AddFormParameter("hashes", hash);

            if (removeData)
            {
                request.AddFormParameter("deleteFiles", "true");
            }

            ProcessRequest(request, settings);
        }

        public void SetTorrentLabel(string hash, string label, QBittorrentSettings settings)
        {
            var request = BuildRequest(settings).Resource("/api/v2/torrents/setCategory")
                                                .Post()
                                                .AddFormParameter("hashes", hash)
                                                .AddFormParameter("category", label);
            ProcessRequest(request, settings);
        }

        public void AddLabel(string label, QBittorrentSettings settings)
        {
            var request = BuildRequest(settings).Resource("/api/v2/torrents/createCategory")
                                                .Post()
                                                .AddFormParameter("category", label);
            ProcessRequest(request, settings);
        }

        public Dictionary<string, QBittorrentLabel> GetLabels(QBittorrentSettings settings)
        {
            var request = BuildRequest(settings).Resource("/api/v2/torrents/categories");
            return Json.Deserialize<Dictionary<string, QBittorrentLabel>>(ProcessRequest(request, settings));
        }

        private void AddTorrentSeedingFormParameters(HttpRequestBuilder request, TorrentSeedConfiguration seedConfiguration, bool always = false)
        {
            var ratioLimit = seedConfiguration.Ratio.HasValue ? seedConfiguration.Ratio : -2;
            var seedingTimeLimit = seedConfiguration.SeedTime.HasValue ? (long)seedConfiguration.SeedTime.Value.TotalMinutes : -2;

            if (ratioLimit != -2 || always)
            {
                request.AddFormParameter("ratioLimit", ratioLimit);
            }

            if (seedingTimeLimit != -2 || always)
            {
                request.AddFormParameter("seedingTimeLimit", seedingTimeLimit);
            }
        }

        private void AddTorrentDownloadFormParameters(HttpRequestBuilder request, QBittorrentSettings settings, bool? forcePaused = null)
        {
            if (settings.TvCategory.IsNotNullOrWhiteSpace())
            {
                request.AddFormParameter("category", settings.TvCategory);
            }

            var paused = forcePaused ?? (QBittorrentState)settings.InitialState == QBittorrentState.Pause;
            request.AddFormParameter("paused", paused ? "true" : "false");

            if (settings.SequentialOrder)
            {
                request.AddFormParameter("sequentialDownload", true);
            }

            if (settings.FirstAndLast)
            {
                request.AddFormParameter("firstLastPiecePrio", true);
            }

            if ((QBittorrentContentLayout)settings.ContentLayout == QBittorrentContentLayout.Original)
            {
                request.AddFormParameter("contentLayout", "Original");
            }
            else if ((QBittorrentContentLayout)settings.ContentLayout == QBittorrentContentLayout.Subfolder)
            {
                request.AddFormParameter("contentLayout", "Subfolder");
            }
        }

        public void SetTorrentSeedingConfiguration(string hash, TorrentSeedConfiguration seedConfiguration, QBittorrentSettings settings)
        {
            var request = BuildRequest(settings).Resource("/api/v2/torrents/setShareLimits")
                                                .Post()
                                                .AddFormParameter("hashes", hash);

            AddTorrentSeedingFormParameters(request, seedConfiguration, true);

            try
            {
                ProcessRequest(request, settings);
            }
            catch (DownloadClientException ex)
            {
                // setShareLimits was added in api v2.0.1 so catch it case of the unlikely event that someone has api v2.0
                if (ex.InnerException is HttpException && (ex.InnerException as HttpException).Response.StatusCode == HttpStatusCode.NotFound)
                {
                    return;
                }

                throw;
            }
        }

        public void MoveTorrentToTopInQueue(string hash, QBittorrentSettings settings)
        {
            var request = BuildRequest(settings).Resource("/api/v2/torrents/topPrio")
                                                .Post()
                                                .AddFormParameter("hashes", hash);

            try
            {
                ProcessRequest(request, settings);
            }
            catch (DownloadClientException ex)
            {
                // qBittorrent rejects all Prio commands with 409: Conflict if Options -> BitTorrent -> Torrent Queueing is not enabled
                if (ex.InnerException is HttpException && (ex.InnerException as HttpException).Response.StatusCode == HttpStatusCode.Conflict)
                {
                    return;
                }

                throw;
            }
        }

        public void PauseTorrent(string hash, QBittorrentSettings settings)
        {
            var resource = IsQBitTorrent5OrLater(settings)
                ? "/api/v2/torrents/stop"
                : "/api/v2/torrents/pause";

            var request = BuildRequest(settings).Resource(resource)
                                                .Post()
                                                .AddFormParameter("hashes", hash);
            ProcessRequest(request, settings);
        }

        public void ResumeTorrent(string hash, QBittorrentSettings settings)
        {
            var resource = IsQBitTorrent5OrLater(settings)
                ? "/api/v2/torrents/start"
                : "/api/v2/torrents/resume";

            var request = BuildRequest(settings).Resource(resource)
                                                .Post()
                                                .AddFormParameter("hashes", hash);
            ProcessRequest(request, settings);
        }

        private bool IsQBitTorrent5OrLater(QBittorrentSettings settings)
        {
            var cacheKey = $"{settings.Host}:{settings.Port}";

            return _isQBitTorrent5Cache.Get(cacheKey, () => FetchIsQBitTorrent5OrLater(settings), TimeSpan.FromDays(1));
        }

        private bool FetchIsQBitTorrent5OrLater(QBittorrentSettings settings)
        {
            var version = GetVersion(settings);
            var versionPart = version.Split('-', ' ')[0];

            return Version.TryParse(versionPart, out var parsed) && parsed.Major >= 5;
        }

        public void SetForceStart(string hash, bool enabled, QBittorrentSettings settings)
        {
            var request = BuildRequest(settings).Resource("/api/v2/torrents/setForceStart")
                                                .Post()
                                                .AddFormParameter("hashes", hash)
                                                .AddFormParameter("value", enabled ? "true" : "false");
            ProcessRequest(request, settings);
        }

        public void SetFilesWanted(string hash, IEnumerable<int> wantedFileIndices, QBittorrentSettings settings)
        {
            var files = GetTorrentFiles(hash, settings);
            var wanted = new HashSet<int>(wantedFileIndices);

            foreach (var file in files)
            {
                var priority = wanted.Contains(file.Index) ? 1 : 0;
                var request = BuildRequest(settings).Resource("/api/v2/torrents/filePrio")
                                                    .Post()
                                                    .AddFormParameter("hash", hash)
                                                    .AddFormParameter("id", file.Index.ToString())
                                                    .AddFormParameter("priority", priority.ToString());
                ProcessRequest(request, settings);
            }
        }

        public void SetFilesUnwanted(string hash, IEnumerable<int> unwantedFileIndices, QBittorrentSettings settings)
        {
            foreach (var index in unwantedFileIndices)
            {
                var request = BuildRequest(settings).Resource("/api/v2/torrents/filePrio")
                                                    .Post()
                                                    .AddFormParameter("hash", hash)
                                                    .AddFormParameter("id", index.ToString())
                                                    .AddFormParameter("priority", "0");
                ProcessRequest(request, settings);
            }
        }

        private static HttpRequestBuilder BuildRequest(QBittorrentSettings settings)
        {
            var requestBuilder = new HttpRequestBuilder(settings.UseSsl, settings.Host, settings.Port, settings.UrlBase)
            {
                LogResponseContent = true,
                StoreRequestCookie = false
            };

            if (settings.ApiKey.IsNotNullOrWhiteSpace())
            {
                requestBuilder.Headers["Authorization"] = $"Bearer {settings.ApiKey}";
            }

            return requestBuilder;
        }

        private TResult ProcessRequest<TResult>(HttpRequestBuilder requestBuilder, QBittorrentSettings settings)
            where TResult : new()
        {
            var responseContent = ProcessRequest(requestBuilder, settings);

            return Json.Deserialize<TResult>(responseContent);
        }

        private string ProcessRequest(HttpRequestBuilder requestBuilder, QBittorrentSettings settings)
        {
            var request = requestBuilder.Build();
            request.LogResponseContent = true;

            if (settings.ApiKey.IsNotNullOrWhiteSpace())
            {
                try
                {
                    return _httpClient.Execute(request).Content;
                }
                catch (HttpException ex)
                {
                    if (ex.Response.StatusCode is HttpStatusCode.Unauthorized or HttpStatusCode.Forbidden)
                    {
                        _logger.Debug(ex, "qbitTorrent authentication failed.");

                        throw new DownloadClientAuthenticationException("Failed to authenticate with qBittorrent.", ex);
                    }

                    throw new DownloadClientException("Failed to connect to qBittorrent, check your settings.", ex);
                }
                catch (Exception ex)
                {
                    throw new DownloadClientException("Failed to connect to qBittorrent, please check your settings.", ex);
                }
            }

            AuthenticateClient(requestBuilder, settings);

            request.SuppressHttpErrorStatusCodes = new[] { HttpStatusCode.Forbidden };

            try
            {
                var response = _httpClient.Execute(request);

                if (response.StatusCode == HttpStatusCode.Forbidden)
                {
                    _logger.Debug("Authentication required, logging in.");

                    AuthenticateClient(requestBuilder, settings, true);

                    request = requestBuilder.Build();

                    response = _httpClient.Execute(request);
                }

                return response.Content;
            }
            catch (HttpException ex)
            {
                throw new DownloadClientException("Failed to connect to qBittorrent, check your settings.", ex);
            }
            catch (Exception ex)
            {
                throw new DownloadClientException("Failed to connect to qBittorrent, please check your settings.", ex);
            }
        }

        private void AuthenticateClient(HttpRequestBuilder requestBuilder, QBittorrentSettings settings, bool reauthenticate = false)
        {
            if (settings.Username.IsNullOrWhiteSpace() || settings.Password.IsNullOrWhiteSpace())
            {
                if (reauthenticate)
                {
                    throw new DownloadClientAuthenticationException("Failed to authenticate with qBittorrent.");
                }

                return;
            }

            var authKey = $"{requestBuilder.BaseUrl}:{settings.Username}:{settings.Password}";

            var cookies = _authCookieCache.Find(authKey);

            if (cookies == null || reauthenticate)
            {
                _authCookieCache.Remove(authKey);

                var authRequestBuilder = BuildRequest(settings);

                var authLoginRequest = authRequestBuilder.Resource("/api/v2/auth/login")
                    .Post()
                    .AddFormParameter("username", settings.Username ?? string.Empty)
                    .AddFormParameter("password", settings.Password ?? string.Empty)
                    .Build();

                HttpResponse response;
                try
                {
                    response = _httpClient.Execute(authLoginRequest);
                }
                catch (HttpException ex)
                {
                    _logger.Debug(ex, "qbitTorrent authentication failed.");

                    if (ex.Response.StatusCode is HttpStatusCode.Unauthorized or HttpStatusCode.Forbidden)
                    {
                        throw new DownloadClientAuthenticationException("Failed to authenticate with qBittorrent.", ex);
                    }

                    throw new DownloadClientException("Failed to connect to qBittorrent, please check your settings.", ex);
                }
                catch (WebException ex)
                {
                    throw new DownloadClientUnavailableException("Failed to connect to qBittorrent, please check your settings.", ex);
                }

                if (response.Content.IsNotNullOrWhiteSpace() && response.Content != "Ok.")
                {
                    // returns "Fails." on bad login
                    _logger.Debug("qbitTorrent authentication failed.");
                    throw new DownloadClientAuthenticationException("Failed to authenticate with qBittorrent.");
                }

                _logger.Debug("qBittorrent authentication succeeded.");

                cookies = response.GetCookies();

                _authCookieCache.Set(authKey, cookies);
            }

            requestBuilder.SetCookies(cookies);
        }
    }
}
