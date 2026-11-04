using System.IO;
using System.Linq;
using NLog;
using NzbDrone.Common.Disk;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.MediaFiles.EpisodeImport.Aggregation.Aggregators.Augmenters.Quality;
using NzbDrone.Core.MediaFiles.Events;
using NzbDrone.Core.Messaging.Events;
using NzbDrone.Core.Parser.Model;
using NzbDrone.Core.Qualities;
using NzbDrone.Core.Tv;

namespace NzbDrone.Core.MediaFiles.MediaInfo
{
    public interface IUpdateMediaInfo
    {
        bool Update(EpisodeFile episodeFile, Series series);
        bool UpdateMediaInfo(EpisodeFile episodeFile, Series series);
    }

    public class UpdateMediaInfoService : IUpdateMediaInfo, IHandle<SeriesScannedEvent>
    {
        private readonly IDiskProvider _diskProvider;
        private readonly IMediaFileService _mediaFileService;
        private readonly IVideoFileInfoReader _videoFileInfoReader;
        private readonly IConfigService _configService;
        private readonly Logger _logger;

        public UpdateMediaInfoService(IDiskProvider diskProvider,
                                IMediaFileService mediaFileService,
                                IVideoFileInfoReader videoFileInfoReader,
                                IConfigService configService,
                                Logger logger)
        {
            _diskProvider = diskProvider;
            _mediaFileService = mediaFileService;
            _videoFileInfoReader = videoFileInfoReader;
            _configService = configService;
            _logger = logger;
        }

        public void Handle(SeriesScannedEvent message)
        {
            if (!_configService.EnableMediaInfo)
            {
                _logger.Debug("MediaInfo is disabled");
                return;
            }

            var allMediaFiles = _mediaFileService.GetFilesBySeries(message.Series.Id);
            var filteredMediaFiles = allMediaFiles.Where(c =>
                c.MediaInfo == null ||
                c.MediaInfo.SchemaRevision < VideoFileInfoReader.MINIMUM_MEDIA_INFO_SCHEMA_REVISION).ToList();

            foreach (var mediaFile in filteredMediaFiles)
            {
                UpdateMediaInfo(mediaFile, message.Series);
            }

            foreach (var mediaFile in allMediaFiles.Where(QualityIsUnknown))
            {
                if (HasDimensions(mediaFile.MediaInfo))
                {
                    if (TrySetQualityFromMediaInfo(mediaFile))
                    {
                        _mediaFileService.Update(mediaFile);
                        _logger.Debug("Updated quality for '{0}' to {1}", mediaFile.RelativePath, mediaFile.Quality);
                    }
                }
                else if (!filteredMediaFiles.Contains(mediaFile))
                {
                    UpdateMediaInfo(mediaFile, message.Series);
                }
            }
        }

        public bool Update(EpisodeFile episodeFile, Series series)
        {
            if (!_configService.EnableMediaInfo)
            {
                _logger.Debug("MediaInfo is disabled");
                return false;
            }

            return UpdateMediaInfo(episodeFile, series);
        }

        public bool UpdateMediaInfo(EpisodeFile episodeFile, Series series)
        {
            var path = episodeFile.Path.IsNotNullOrWhiteSpace() ? episodeFile.Path : Path.Combine(series.Path, episodeFile.RelativePath);

            if (!_diskProvider.FileExists(path))
            {
                _logger.Debug("Can't update MediaInfo because '{0}' does not exist", path);
                return false;
            }

            var updatedMediaInfo = _videoFileInfoReader.GetMediaInfo(path);

            if (updatedMediaInfo == null)
            {
                return false;
            }

            episodeFile.MediaInfo = updatedMediaInfo;
            TrySetQualityFromMediaInfo(episodeFile);
            _mediaFileService.Update(episodeFile);
            _logger.Debug("Updated MediaInfo for '{0}'", path);

            return true;
        }

        private static bool QualityIsUnknown(EpisodeFile episodeFile)
        {
            return episodeFile.Quality != null &&
                   (episodeFile.Quality.Quality == null || episodeFile.Quality.Quality == Quality.Unknown);
        }

        private static bool HasDimensions(MediaInfoModel mediaInfo)
        {
            return mediaInfo != null && (mediaInfo.Width > 0 || mediaInfo.Height > 0);
        }

        private bool TrySetQualityFromMediaInfo(EpisodeFile episodeFile)
        {
            if (!QualityIsUnknown(episodeFile))
            {
                return false;
            }

            var quality = QualityFromMediaInfo(episodeFile.MediaInfo);

            if (quality == null || quality.Quality == Quality.Unknown)
            {
                return false;
            }

            episodeFile.Quality = quality;

            return true;
        }

        private QualityModel QualityFromMediaInfo(MediaInfoModel mediaInfo)
        {
            if (!HasDimensions(mediaInfo))
            {
                return null;
            }

            var augmented = new AugmentQualityFromMediaInfo(_logger).AugmentQuality(new LocalEpisode
            {
                MediaInfo = mediaInfo
            }, null);

            if (augmented == null || augmented.Resolution <= 0)
            {
                return null;
            }

            var quality = new QualityModel(
                QualityFinder.FindBySourceAndResolution(augmented.Source, augmented.Resolution),
                augmented.Revision ?? new Revision());

            if (quality.Quality == Quality.Unknown)
            {
                return null;
            }

            quality.ResolutionDetectionSource = augmented.ResolutionConfidence == Confidence.MediaInfo
                ? QualityDetectionSource.MediaInfo
                : QualityDetectionSource.Name;
            quality.SourceDetectionSource = augmented.SourceConfidence == Confidence.Fallback
                ? QualityDetectionSource.Extension
                : QualityDetectionSource.Name;
            quality.RevisionDetectionSource = QualityDetectionSource.Unknown;

            return quality;
        }
    }
}
