using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using NLog;
using NzbDrone.Common.Disk;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.Exceptions;
using NzbDrone.Core.MediaFiles.Events;
using NzbDrone.Core.Messaging;
using NzbDrone.Core.Messaging.Events;
using NzbDrone.Core.Tv;
using NzbDrone.Core.Tv.Events;

namespace NzbDrone.Core.MediaFiles
{
    public interface IDeleteMediaFiles
    {
        void DeleteEpisodeFile(Series series, EpisodeFile episodeFile);
        void DeleteEpisodeFiles(List<EpisodeFile> episodeFiles);
    }

    public class MediaFileDeletionService : IDeleteMediaFiles,
                                            IHandleAsync<SeriesDeletedEvent>,
                                            IHandle<EpisodeFileDeletedEvent>
    {
        private readonly IDiskProvider _diskProvider;
        private readonly IRecycleBinProvider _recycleBinProvider;
        private readonly IMediaFileService _mediaFileService;
        private readonly ISeriesService _seriesService;
        private readonly IEpisodeFileHardLinkRepository _hardLinkRepository;
        private readonly IConfigService _configService;
        private readonly IEventAggregator _eventAggregator;
        private readonly Logger _logger;

        public MediaFileDeletionService(IDiskProvider diskProvider,
                                        IRecycleBinProvider recycleBinProvider,
                                        IMediaFileService mediaFileService,
                                        ISeriesService seriesService,
                                        IEpisodeFileHardLinkRepository hardLinkRepository,
                                        IConfigService configService,
                                        IEventAggregator eventAggregator,
                                        Logger logger)
        {
            _diskProvider = diskProvider;
            _recycleBinProvider = recycleBinProvider;
            _mediaFileService = mediaFileService;
            _seriesService = seriesService;
            _hardLinkRepository = hardLinkRepository;
            _configService = configService;
            _eventAggregator = eventAggregator;
            _logger = logger;
        }

        public void DeleteEpisodeFiles(List<EpisodeFile> episodeFiles)
        {
            foreach (var episodeFile in episodeFiles ?? new List<EpisodeFile>())
            {
                if (episodeFile == null)
                {
                    continue;
                }

                if (episodeFile.Id > 0 && _mediaFileService.Find(episodeFile.Id) == null)
                {
                    continue;
                }

                var series = _seriesService.GetSeries(episodeFile.SeriesId);
                DeleteEpisodeFile(series, episodeFile);
            }
        }

        public void DeleteEpisodeFile(Series series, EpisodeFile episodeFile)
        {
            DeleteEpisodeFile(series, episodeFile, publishCompleted: true);
        }

        private List<int> DeleteEpisodeFile(Series series, EpisodeFile episodeFile, bool publishCompleted)
        {
            var fullPath = Path.Combine(series.Path, episodeFile.RelativePath);
            EnsureRootFolder(series);

            List<int> removedIds;

            if (_configService.DeleteBehavior == DeleteBehavior.UnderlyingFile)
            {
                if (episodeFile.Id > 0 && _mediaFileService.Find(episodeFile.Id) == null)
                {
                    return new List<int>();
                }

                removedIds = DeleteUnderlyingFile(series, episodeFile, fullPath);
            }
            else
            {
                DeleteTrackedFile(series, episodeFile, fullPath);
                removedIds = new List<int> { episodeFile.Id };
            }

            if (publishCompleted)
            {
                _eventAggregator.PublishEvent(new DeleteCompletedEvent());
            }

            return removedIds;
        }

        private void EnsureRootFolder(Series series)
        {
            var rootFolder = _diskProvider.GetParentFolder(series.Path);

            if (!_diskProvider.FolderExists(rootFolder))
            {
                _logger.Warn("Series' root folder ({0}) doesn't exist.", rootFolder);
                throw new NzbDroneClientException(HttpStatusCode.Conflict, "Series' root folder ({0}) doesn't exist.", rootFolder);
            }

            if (_diskProvider.GetDirectories(rootFolder).Empty())
            {
                _logger.Warn("Series' root folder ({0}) is empty.", rootFolder);
                throw new NzbDroneClientException(HttpStatusCode.Conflict, "Series' root folder ({0}) is empty.", rootFolder);
            }
        }

        private void DeleteTrackedFile(Series series, EpisodeFile episodeFile, string fullPath)
        {
            if (_diskProvider.FolderExists(series.Path) && _diskProvider.FileExists(fullPath))
            {
                _logger.Info("Deleting episode file: {0}", fullPath);
                RecycleFile(series, fullPath);
            }

            _mediaFileService.Delete(episodeFile, DeleteMediaFileReason.Manual);
        }

        private List<int> DeleteUnderlyingFile(Series series, EpisodeFile episodeFile, string fullPath)
        {
            var storedVolume = episodeFile.HardLinkVolumeId;
            var storedFileId = episodeFile.HardLinkFileId;
            var identity = _diskProvider.FileExists(fullPath) ? _diskProvider.GetFileLinkIdentity(fullPath) : null;
            var trusted = identity != null &&
                          storedVolume.IsNotNullOrWhiteSpace() &&
                          storedFileId.IsNotNullOrWhiteSpace() &&
                          identity.VolumeId == storedVolume &&
                          identity.FileId == storedFileId;

            List<EpisodeFile> related;
            List<string> paths;

            if (!trusted)
            {
                _logger.Warn("Hard links for {0} are not indexed or no longer match. Deleting the tracked file only. Refresh to discover hard links.", fullPath);
                related = new List<EpisodeFile> { episodeFile };
                paths = new List<string> { fullPath };
            }
            else
            {
                related = _mediaFileService.GetFilesByHardLinkIdentity(storedVolume, storedFileId);

                if (!related.Any(file => file.Id == episodeFile.Id))
                {
                    related.Add(episodeFile);
                }

                paths = _hardLinkRepository.GetByEpisodeFileIds(related.Select(file => file.Id).ToList())
                                           .Select(link => link.Path)
                                           .Where(path => path.IsNotNullOrWhiteSpace())
                                           .Distinct()
                                           .ToList();

                if (!paths.Any(path => path.PathEquals(fullPath)))
                {
                    paths.Add(fullPath);
                }
            }

            if (_diskProvider.FolderExists(series.Path) && _diskProvider.FileExists(fullPath))
            {
                _logger.Info("Deleting episode file: {0}", fullPath);
                RecycleFile(series, fullPath);
            }

            if (trusted)
            {
                foreach (var path in paths)
                {
                    if (path.PathEquals(fullPath))
                    {
                        continue;
                    }

                    try
                    {
                        if (!_diskProvider.FileExists(path))
                        {
                            continue;
                        }

                        var pathIdentity = _diskProvider.GetFileLinkIdentity(path);

                        if (pathIdentity == null || pathIdentity.VolumeId != storedVolume || pathIdentity.FileId != storedFileId)
                        {
                            _logger.Debug("Skipping stale hard link {0}", path);
                            continue;
                        }

                        _logger.Info("Deleting hard link: {0}", path);
                        _diskProvider.DeleteFile(path);
                    }
                    catch (Exception ex)
                    {
                        _logger.Error(ex, "Unable to delete hard link {0}", path);
                    }
                }
            }

            foreach (var file in related)
            {
                _mediaFileService.Delete(file, DeleteMediaFileReason.Manual);
            }

            return related.Select(file => file.Id).Distinct().ToList();
        }

        private void RecycleFile(Series series, string fullPath)
        {
            var subfolder = _diskProvider.GetParentFolder(series.Path).GetRelativePath(_diskProvider.GetParentFolder(fullPath));

            try
            {
                _recycleBinProvider.DeleteFile(fullPath, subfolder);
            }
            catch (Exception e)
            {
                _logger.Error(e, "Unable to delete episode file");
                throw new NzbDroneClientException(HttpStatusCode.InternalServerError, "Unable to delete episode file");
            }
        }

        public void HandleAsync(SeriesDeletedEvent message)
        {
            if (message.DeleteFiles)
            {
                var allSeries = _seriesService.GetAllSeriesPaths();

                foreach (var series in message.Series)
                {
                    foreach (var s in allSeries)
                    {
                        if (s.Key == series.Id)
                        {
                            continue;
                        }

                        if (series.Path.IsParentPath(s.Value))
                        {
                            _logger.Error("Series path: '{0}' is a parent of another series, not deleting files.", series.Path);
                            return;
                        }

                        if (series.Path.PathEquals(s.Value))
                        {
                            _logger.Error("Series path: '{0}' is the same as another series, not deleting files.", series.Path);
                            return;
                        }
                    }

                    if (_diskProvider.FolderExists(series.Path))
                    {
                        _recycleBinProvider.DeleteFolder(series.Path);
                    }

                    _eventAggregator.PublishEvent(new DeleteCompletedEvent());
                }
            }
        }

        [EventHandleOrder(EventHandleOrder.Last)]
        public void Handle(EpisodeFileDeletedEvent message)
        {
            if (!_configService.DeleteEmptyFolders || message.Reason == DeleteMediaFileReason.MissingFromDisk)
            {
                return;
            }

            var series = message.EpisodeFile.Series.Value;
            var seriesPath = series.Path;
            var folder = message.EpisodeFile.Path.GetParentPath();

            while (seriesPath.IsParentPath(folder))
            {
                if (_diskProvider.FolderExists(folder))
                {
                    _diskProvider.RemoveEmptySubfolders(folder);
                }

                folder = folder.GetParentPath();
            }

            _diskProvider.RemoveEmptySubfolders(seriesPath);

            if (_diskProvider.FolderEmpty(seriesPath))
            {
                _diskProvider.DeleteFolder(seriesPath, true);
            }
        }
    }
}
