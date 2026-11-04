using System;
using System.IO;
using NLog;
using NzbDrone.Common.Disk;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.MediaFiles.Events;
using NzbDrone.Core.Messaging.Commands;
using NzbDrone.Core.Messaging.Events;
using NzbDrone.Core.Tv;

namespace NzbDrone.Core.MediaFiles
{
    public interface IEpisodeFileOsHashService
    {
        void UpdateMissingHashes(Series series);
    }

    public class EpisodeFileOsHashService : IEpisodeFileOsHashService, IHandle<SeriesScannedEvent>
    {
        private readonly IMediaFileService _mediaFileService;
        private readonly IDiskProvider _diskProvider;
        private readonly Logger _logger;

        public EpisodeFileOsHashService(IMediaFileService mediaFileService, IDiskProvider diskProvider, Logger logger)
        {
            _mediaFileService = mediaFileService;
            _diskProvider = diskProvider;
            _logger = logger;
        }

        public void Handle(SeriesScannedEvent message)
        {
            UpdateMissingHashes(message.Series);
        }

        public void UpdateMissingHashes(Series series)
        {
            if (series == null || series.Path.IsNullOrWhiteSpace())
            {
                return;
            }

            foreach (var episodeFile in _mediaFileService.GetFilesBySeries(series.Id))
            {
                CommandCancellation.ThrowIfCancelled();

                if (episodeFile == null || episodeFile.OsHash.IsNotNullOrWhiteSpace() || episodeFile.RelativePath.IsNullOrWhiteSpace())
                {
                    continue;
                }

                var path = Path.Combine(series.Path, episodeFile.RelativePath);

                try
                {
                    if (!_diskProvider.FileExists(path))
                    {
                        _logger.Debug("Can't compute OpenSubtitles hash because '{0}' does not exist", path);
                        continue;
                    }

                    using var stream = _diskProvider.OpenReadStream(path);
                    var hash = OsHash.Compute(stream);

                    if (hash.IsNullOrWhiteSpace())
                    {
                        _logger.Debug("OpenSubtitles hash was not computed for '{0}'", path);
                        continue;
                    }

                    episodeFile.OsHash = hash;
                    _mediaFileService.SetOsHash(episodeFile);
                    _logger.Debug("Stored OpenSubtitles hash {0} for '{1}'", hash, path);
                }
                catch (Exception ex)
                {
                    _logger.Debug(ex, "Couldn't compute OpenSubtitles hash for '{0}'", path);
                }
            }
        }
    }
}
