using System.Collections.Generic;
using System.IO;
using System.Linq;
using NLog;
using NzbDrone.Common;
using NzbDrone.Core.MediaFiles.Events;
using NzbDrone.Core.Messaging.Events;
using NzbDrone.Core.Tv;
using NzbDrone.Core.Tv.Events;

namespace NzbDrone.Core.MediaFiles
{
    public interface IMediaFileService
    {
        EpisodeFile Add(EpisodeFile episodeFile);
        void Update(EpisodeFile episodeFile);
        void Update(List<EpisodeFile> episodeFiles);
        void Delete(EpisodeFile episodeFile, DeleteMediaFileReason reason);
        List<EpisodeFile> GetFilesBySeries(int seriesId);
        List<EpisodeFile> GetFilesBySeason(int seriesId, int seasonNumber);
        List<EpisodeFile> GetFiles(IEnumerable<int> ids);
        List<EpisodeFile> FindFiles(IEnumerable<int> ids);
        List<EpisodeFile> GetFilesWithoutMediaInfo();
        List<string> FilterExistingFiles(List<string> files, Series series);
        EpisodeFile Get(int id);
        List<EpisodeFile> Get(IEnumerable<int> ids);
        List<EpisodeFile> GetFilesWithRelativePath(int seriesId, string relativePath);
        List<EpisodeFile> GetFilesByHardLinkIdentity(string volumeId, string fileId);
        EpisodeFile Find(int id);
        void SetHardLinkIdentity(EpisodeFile episodeFile);
    }

    public class MediaFileService : IMediaFileService, IHandleAsync<SeriesDeletedEvent>
    {
        private readonly IEventAggregator _eventAggregator;
        private readonly IMediaFileRepository _mediaFileRepository;
        private readonly IEpisodeFileHardLinkRepository _hardLinkRepository;
        private readonly Logger _logger;

        public MediaFileService(IMediaFileRepository mediaFileRepository,
                                IEpisodeFileHardLinkRepository hardLinkRepository,
                                IEventAggregator eventAggregator,
                                Logger logger)
        {
            _mediaFileRepository = mediaFileRepository;
            _hardLinkRepository = hardLinkRepository;
            _eventAggregator = eventAggregator;
            _logger = logger;
        }

        public EpisodeFile Add(EpisodeFile episodeFile)
        {
            var addedFile = _mediaFileRepository.Insert(episodeFile);
            _eventAggregator.PublishEvent(new EpisodeFileAddedEvent(addedFile));
            return addedFile;
        }

        public void Update(EpisodeFile episodeFile)
        {
            _mediaFileRepository.Update(episodeFile);
        }

        public void Update(List<EpisodeFile> episodeFiles)
        {
            _mediaFileRepository.UpdateMany(episodeFiles);
        }

        public void Delete(EpisodeFile episodeFile, DeleteMediaFileReason reason)
        {
            // Little hack so we have the episodes and series attached for the event consumers
            episodeFile.Episodes?.LazyLoad();

            var seriesPath = episodeFile.Series?.Value?.Path;

            if (!string.IsNullOrWhiteSpace(seriesPath) && !string.IsNullOrWhiteSpace(episodeFile.RelativePath))
            {
                episodeFile.Path = Path.Combine(seriesPath, episodeFile.RelativePath);
            }

            _hardLinkRepository.DeleteForEpisodeFile(episodeFile.Id);
            _mediaFileRepository.Delete(episodeFile);
            _eventAggregator.PublishEvent(new EpisodeFileDeletedEvent(episodeFile, reason));
        }

        public List<EpisodeFile> GetFilesBySeries(int seriesId)
        {
            return _mediaFileRepository.GetFilesBySeries(seriesId);
        }

        public List<EpisodeFile> GetFilesBySeason(int seriesId, int seasonNumber)
        {
            return _mediaFileRepository.GetFilesBySeason(seriesId, seasonNumber);
        }

        public List<EpisodeFile> GetFiles(IEnumerable<int> ids)
        {
            return _mediaFileRepository.Get(ids).ToList();
        }

        public List<EpisodeFile> FindFiles(IEnumerable<int> ids)
        {
            return _mediaFileRepository.FindByIds(ids?.Distinct().ToList());
        }

        public List<EpisodeFile> GetFilesWithoutMediaInfo()
        {
            return _mediaFileRepository.GetFilesWithoutMediaInfo();
        }

        public List<string> FilterExistingFiles(List<string> files, Series series)
        {
            var seriesFiles = GetFilesBySeries(series.Id);

            return FilterExistingFiles(files, seriesFiles, series);
        }

        public EpisodeFile Get(int id)
        {
            return _mediaFileRepository.Get(id);
        }

        public List<EpisodeFile> Get(IEnumerable<int> ids)
        {
            return _mediaFileRepository.Get(ids).ToList();
        }

        public List<EpisodeFile> GetFilesWithRelativePath(int seriesId, string relativePath)
        {
            return _mediaFileRepository.GetFilesWithRelativePath(seriesId, relativePath);
        }

        public List<EpisodeFile> GetFilesByHardLinkIdentity(string volumeId, string fileId)
        {
            return _mediaFileRepository.GetFilesByHardLinkIdentity(volumeId, fileId);
        }

        public EpisodeFile Find(int id)
        {
            return _mediaFileRepository.Find(id);
        }

        public void SetHardLinkIdentity(EpisodeFile episodeFile)
        {
            _mediaFileRepository.SetFields(episodeFile, file => file.HardLinkVolumeId, file => file.HardLinkFileId);
        }

        public void HandleAsync(SeriesDeletedEvent message)
        {
            var seriesIds = message.Series.Select(s => s.Id).ToList();

            foreach (var seriesId in seriesIds)
            {
                foreach (var file in _mediaFileRepository.GetFilesBySeries(seriesId))
                {
                    _hardLinkRepository.DeleteForEpisodeFile(file.Id);
                }
            }

            _mediaFileRepository.DeleteForSeries(seriesIds);
        }

        public static List<string> FilterExistingFiles(List<string> files, List<EpisodeFile> seriesFiles, Series series)
        {
            var seriesFilePaths = seriesFiles.Select(f => Path.Combine(series.Path, f.RelativePath)).ToList();

            if (!seriesFilePaths.Any())
            {
                return files;
            }

            return files.Except(seriesFilePaths, PathEqualityComparer.Instance).ToList();
        }
    }
}
