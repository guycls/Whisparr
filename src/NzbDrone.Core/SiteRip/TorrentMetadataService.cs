using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using MonoTorrent;
using NLog;
using NzbDrone.Common.Extensions;
using NzbDrone.Common.Http;
using NzbDrone.Core.Download;
using NzbDrone.Core.Indexers;
using NzbDrone.Core.MediaFiles;
using NzbDrone.Core.Parser.Model;

namespace NzbDrone.Core.SiteRip
{
    public interface ITorrentMetadataService
    {
        Task<List<TorrentFileMetadata>> GetVideoFiles(RemoteEpisode remoteEpisode, IIndexer indexer);
        Task<List<TorrentFileMetadata>> GetVideoFilesFromBytes(byte[] torrentBytes);
    }

    public class TorrentMetadataService : ITorrentMetadataService
    {
        private readonly IHttpClient _httpClient;
        private readonly Logger _logger;

        public TorrentMetadataService(IHttpClient httpClient, Logger logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        public async Task<List<TorrentFileMetadata>> GetVideoFiles(RemoteEpisode remoteEpisode, IIndexer indexer)
        {
            var torrentBytes = await DownloadTorrentBytes(remoteEpisode, indexer);
            return await GetVideoFilesFromBytes(torrentBytes);
        }

        public Task<List<TorrentFileMetadata>> GetVideoFilesFromBytes(byte[] torrentBytes)
        {
            var torrent = Torrent.Load(torrentBytes);
            var files = new List<TorrentFileMetadata>();

            for (var i = 0; i < torrent.Files.Count; i++)
            {
                var file = torrent.Files[i];
                var path = file.Path;
                var extension = Path.GetExtension(path);

                if (!MediaFileExtensions.Extensions.Contains(extension))
                {
                    continue;
                }

                files.Add(new TorrentFileMetadata
                {
                    Index = i,
                    Path = path,
                    Name = Path.GetFileName(path),
                    Size = file.Length
                });
            }

            return Task.FromResult(files);
        }

        private async Task<byte[]> DownloadTorrentBytes(RemoteEpisode remoteEpisode, IIndexer indexer)
        {
            var torrentInfo = remoteEpisode.Release as TorrentInfo;
            string magnetUrl = null;
            string torrentUrl = null;

            if (remoteEpisode.Release.DownloadUrl.IsNotNullOrWhiteSpace() && remoteEpisode.Release.DownloadUrl.StartsWith("magnet:"))
            {
                magnetUrl = remoteEpisode.Release.DownloadUrl;
            }
            else
            {
                torrentUrl = remoteEpisode.Release.DownloadUrl;
            }

            if (torrentInfo != null && !torrentInfo.MagnetUrl.IsNullOrWhiteSpace())
            {
                magnetUrl = torrentInfo.MagnetUrl;
            }

            if (torrentUrl.IsNotNullOrWhiteSpace())
            {
                return await DownloadFromWebUrl(remoteEpisode, indexer, torrentUrl);
            }

            if (magnetUrl.IsNotNullOrWhiteSpace())
            {
                throw new SiteRipException("Magnet-only torrents cannot be inspected before download. Try a release with a .torrent file.");
            }

            throw new SiteRipException("No torrent URL available for this release");
        }

        private async Task<byte[]> DownloadFromWebUrl(RemoteEpisode remoteEpisode, IIndexer indexer, string torrentUrl)
        {
            var request = indexer?.GetDownloadRequest(torrentUrl) ?? new HttpRequest(torrentUrl);
            request.RateLimitKey = remoteEpisode?.Release?.IndexerId.ToString();
            request.Headers.Accept = "application/x-bittorrent";
            request.AllowAutoRedirect = false;

            var response = await _httpClient.GetAsync(request);

            if (response.StatusCode == HttpStatusCode.MovedPermanently ||
                response.StatusCode == HttpStatusCode.Found ||
                response.StatusCode == HttpStatusCode.SeeOther)
            {
                var locationHeader = response.Headers.GetSingleValue("Location");

                if (locationHeader != null)
                {
                    if (locationHeader.StartsWith("magnet:"))
                    {
                        throw new SiteRipException("Torrent redirected to magnet link. Cannot inspect file list.");
                    }

                    return await DownloadFromWebUrl(remoteEpisode, indexer, locationHeader);
                }
            }

            return response.ResponseData;
        }
    }

    public class SiteRipException : Exception
    {
        public SiteRipException(string message)
            : base(message)
        {
        }
    }
}
