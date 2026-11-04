using System.Collections.Generic;
using System.Linq;
using NzbDrone.Core.Datastore;
using NzbDrone.Core.Messaging.Commands;
using NzbDrone.Core.Tv.Commands;

namespace NzbDrone.Core.Tv
{
    public class DeleteSeriesService : IExecute<DeleteSeriesCommand>
    {
        private readonly ISeriesService _seriesService;
        private readonly ICommandProgressReporter _commandProgressReporter;

        public DeleteSeriesService(ISeriesService seriesService, ICommandProgressReporter commandProgressReporter)
        {
            _seriesService = seriesService;
            _commandProgressReporter = commandProgressReporter;
        }

        public void Execute(DeleteSeriesCommand message)
        {
            var series = new List<Series>();

            foreach (var seriesId in message.SeriesIds?.Distinct() ?? Enumerable.Empty<int>())
            {
                try
                {
                    series.Add(_seriesService.GetSeries(seriesId));
                }
                catch (ModelNotFoundException)
                {
                }
            }

            if (series.Count == 0)
            {
                return;
            }

            var progress = new SceneProgressTracker(_commandProgressReporter, series[0].Title, series.Count);

            foreach (var current in series)
            {
                _seriesService.DeleteSeries(new List<int> { current.Id }, message.DeleteFiles, message.AddImportListExclusion);
                progress.ReportSceneProcessed(current.Title);
            }
        }
    }
}
