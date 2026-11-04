using System.Collections.Generic;
using System.Linq;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.MediaFiles.Commands;
using NzbDrone.Core.Messaging.Commands;
using NzbDrone.Core.Tv;

namespace NzbDrone.Core.MediaFiles
{
    public class DeleteEpisodeFilesService : IExecute<DeleteEpisodeFilesCommand>
    {
        private readonly IMediaFileService _mediaFileService;
        private readonly IDeleteMediaFiles _mediaFileDeletionService;
        private readonly ISeriesService _seriesService;
        private readonly ICommandProgressReporter _commandProgressReporter;

        public DeleteEpisodeFilesService(IMediaFileService mediaFileService,
                                         IDeleteMediaFiles mediaFileDeletionService,
                                         ISeriesService seriesService,
                                         ICommandProgressReporter commandProgressReporter)
        {
            _mediaFileService = mediaFileService;
            _mediaFileDeletionService = mediaFileDeletionService;
            _seriesService = seriesService;
            _commandProgressReporter = commandProgressReporter;
        }

        public void Execute(DeleteEpisodeFilesCommand message)
        {
            var files = _mediaFileService.FindFiles(message.EpisodeFileIds);

            if (!files.Any())
            {
                return;
            }

            var seriesById = new Dictionary<int, Series>();
            var progress = new SceneProgressTracker(_commandProgressReporter, null, files.Count);

            foreach (var file in files)
            {
                if (!seriesById.TryGetValue(file.SeriesId, out var series))
                {
                    try
                    {
                        series = _seriesService.GetSeries(file.SeriesId);
                        seriesById[file.SeriesId] = series;
                    }
                    catch (ModelNotFoundException)
                    {
                        progress.ReportSceneProcessed();
                        continue;
                    }
                }

                _mediaFileDeletionService.DeleteEpisodeFile(series, file);
                progress.ReportSceneProcessed(series.Title);
            }
        }
    }
}
