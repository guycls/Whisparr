using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using NLog;
using NzbDrone.Common.Extensions;
using NzbDrone.Common.Instrumentation.Extensions;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.DecisionEngine;
using NzbDrone.Core.Indexers;
using NzbDrone.Core.IndexerSearch.Definitions;
using NzbDrone.Core.Parser.Model;
using NzbDrone.Core.Tv;

namespace NzbDrone.Core.IndexerSearch
{
    public interface ISearchForReleases
    {
        Task<List<DownloadDecision>> EpisodeSearch(int episodeId, bool userInvokedSearch, bool interactiveSearch, string searchId = null);
        Task<List<DownloadDecision>> EpisodeSearch(Episode episode, bool userInvokedSearch, bool interactiveSearch, string searchId = null);
        Task<List<DownloadDecision>> SeasonSearch(int seriesId, int seasonNumber, bool missingOnly, bool monitoredOnly, bool userInvokedSearch, bool interactiveSearch, string searchId = null);
        Task<List<DownloadDecision>> SeasonSearch(int seriesId, int seasonNumber, List<Episode> episodes, bool monitoredOnly, bool userInvokedSearch, bool interactiveSearch, string searchId = null);
        Task<List<DownloadDecision>> SiteRipSearch(int seriesId, bool userInvokedSearch, bool interactiveSearch, string searchId = null);
    }

    public class ReleaseSearchService : ISearchForReleases
    {
        private readonly IIndexerFactory _indexerFactory;
        private readonly ISeriesService _seriesService;
        private readonly IEpisodeService _episodeService;
        private readonly IMakeDownloadDecision _makeDownloadDecision;
        private readonly IConfigService _configService;
        private readonly ISearchProgressService _searchProgressService;
        private readonly Logger _logger;

        public ReleaseSearchService(IIndexerFactory indexerFactory,
                                ISeriesService seriesService,
                                IEpisodeService episodeService,
                                IMakeDownloadDecision makeDownloadDecision,
                                IConfigService configService,
                                ISearchProgressService searchProgressService,
                                Logger logger)
        {
            _indexerFactory = indexerFactory;
            _seriesService = seriesService;
            _episodeService = episodeService;
            _makeDownloadDecision = makeDownloadDecision;
            _configService = configService;
            _searchProgressService = searchProgressService;
            _logger = logger;
        }

        public async Task<List<DownloadDecision>> EpisodeSearch(int episodeId, bool userInvokedSearch, bool interactiveSearch, string searchId = null)
        {
            var episode = _episodeService.GetEpisode(episodeId);

            return await EpisodeSearch(episode, userInvokedSearch, interactiveSearch, searchId);
        }

        public async Task<List<DownloadDecision>> EpisodeSearch(Episode episode, bool userInvokedSearch, bool interactiveSearch, string searchId = null)
        {
            var series = _seriesService.GetSeries(episode.SeriesId);

            return await SearchSingle(series, episode, false, userInvokedSearch, interactiveSearch, searchId);
        }

        public async Task<List<DownloadDecision>> SeasonSearch(int seriesId, int seasonNumber, bool missingOnly, bool monitoredOnly, bool userInvokedSearch, bool interactiveSearch, string searchId = null)
        {
            var episodes = _episodeService.GetEpisodesBySeason(seriesId, seasonNumber);

            if (missingOnly)
            {
                episodes = episodes.Where(e => !e.HasFile).ToList();
            }

            return await SeasonSearch(seriesId, seasonNumber, episodes, monitoredOnly, userInvokedSearch, interactiveSearch, searchId);
        }

        public async Task<List<DownloadDecision>> SeasonSearch(int seriesId, int seasonNumber, List<Episode> episodes, bool monitoredOnly, bool userInvokedSearch, bool interactiveSearch, string searchId = null)
        {
            var series = _seriesService.GetSeries(seriesId);

            var downloadDecisions = new List<DownloadDecision>();

            if (episodes.Count == 1)
            {
                var searchSpec = Get<SingleEpisodeSearchCriteria>(series, episodes, monitoredOnly, userInvokedSearch, interactiveSearch);
                var episode = episodes.First();
                searchSpec.ReleaseDate = DateOnly.Parse(episode.AirDate);
                searchSpec.Performer = episode.Actors.Select(p => p.Name).FirstOrDefault();
                searchSpec.EpisodeTitle = episode.Title;
                searchSpec.ExternalId = episode.ExternalId;

                var decisions = await Dispatch(indexer => indexer.Fetch(searchSpec), searchSpec, searchId);
                downloadDecisions.AddRange(decisions);
            }
            else
            {
                var searchSpec = Get<SeasonSearchCriteria>(series, episodes, monitoredOnly, userInvokedSearch, interactiveSearch);
                searchSpec.Year = seasonNumber;

                var decisions = await Dispatch(indexer => indexer.Fetch(searchSpec), searchSpec, searchId);
                downloadDecisions.AddRange(decisions);
            }

            return DeDupeDecisions(downloadDecisions);
        }

        public async Task<List<DownloadDecision>> SiteRipSearch(int seriesId, bool userInvokedSearch, bool interactiveSearch, string searchId = null)
        {
            var series = _seriesService.GetSeries(seriesId);
            var episodes = _episodeService.GetEpisodeBySeries(seriesId);

            var searchSpec = new SiteRipSearchCriteria
            {
                SceneTitles = new List<string> { SiteRipSearchCriteria.GetSearchTerm(series) },
                Series = series,
                Episodes = episodes,
                MonitoredEpisodesOnly = false,
                UserInvokedSearch = userInvokedSearch,
                InteractiveSearch = interactiveSearch,
                IgnoreSceneDate = _configService.IgnoreSceneDate
            };

            var decisions = await Dispatch(indexer => indexer.Fetch(searchSpec), searchSpec, searchId);

            return DeDupeDecisions(decisions);
        }

        private async Task<List<DownloadDecision>> SearchSingle(Series series, Episode episode, bool monitoredOnly, bool userInvokedSearch, bool interactiveSearch, string searchId)
        {
            var downloadDecisions = new List<DownloadDecision>();

            var searchSpec = Get<SingleEpisodeSearchCriteria>(series, new List<Episode> { episode }, monitoredOnly, userInvokedSearch, interactiveSearch);
            searchSpec.ReleaseDate = DateOnly.Parse(episode.AirDate);
            searchSpec.Performer = episode.Actors.Select(p => p.Name).FirstOrDefault();
            searchSpec.EpisodeTitle = episode.Title;
            searchSpec.ExternalId = episode.ExternalId;

            var decisions = await Dispatch(indexer => indexer.Fetch(searchSpec), searchSpec, searchId);
            downloadDecisions.AddRange(decisions);

            return DeDupeDecisions(downloadDecisions);
        }

        private TSpec Get<TSpec>(Series series, List<Episode> episodes, bool monitoredOnly, bool userInvokedSearch, bool interactiveSearch)
            where TSpec : SearchCriteriaBase, new()
        {
            var spec = new TSpec();
            spec.SceneTitles = new List<string> { series.StudioSearchTitle, series.TitleSlug };

            spec.Series = series;
            spec.Episodes = episodes;
            spec.MonitoredEpisodesOnly = monitoredOnly;
            spec.UserInvokedSearch = userInvokedSearch;
            spec.InteractiveSearch = interactiveSearch;
            spec.IgnoreSceneDate = _configService.IgnoreSceneDate;

            if (!spec.SceneTitles.Contains(series.StudioSearchTitle))
            {
                spec.SceneTitles.Add(series.StudioSearchTitle);
            }

            return spec;
        }

        private async Task<List<DownloadDecision>> Dispatch(Func<IIndexer, Task<IList<ReleaseInfo>>> searchAction, SearchCriteriaBase criteriaBase, string searchId)
        {
            var trackProgress = criteriaBase.InteractiveSearch && searchId.IsNotNullOrWhiteSpace();

            if (trackProgress)
            {
                _searchProgressService.Start(searchId);
            }

            try
            {
                var indexers = criteriaBase.InteractiveSearch ?
                    _indexerFactory.InteractiveSearchEnabled() :
                    _indexerFactory.AutomaticSearchEnabled();

                indexers = indexers.Where(i => i.Definition.Tags.Empty() || i.Definition.Tags.Intersect(criteriaBase.Series.Tags).Any()).ToList();

                _logger.ProgressInfo("Searching indexers for {0}. {1} active indexers", criteriaBase, indexers.Count);

                if (trackProgress)
                {
                    _searchProgressService.ReportPreparing(searchId, criteriaBase, indexers.Count);
                }

                var completedIndexers = 0;
                var totalIndexers = indexers.Count;

                var tasks = indexers.Select(indexer => DispatchIndexer(searchAction, indexer, criteriaBase, searchId, totalIndexers, () => Interlocked.Increment(ref completedIndexers)));

                var batch = await Task.WhenAll(tasks);

                var reports = batch.SelectMany(x => x).ToList();

                _logger.ProgressDebug("Total of {0} reports were found for {1} from {2} indexers", reports.Count, criteriaBase, indexers.Count);

                if (trackProgress)
                {
                    _searchProgressService.ReportAggregating(searchId, reports.Count);
                }

                if (indexers.Any())
                {
                    var baseSearchTime = DateTime.UtcNow;
                    var episodeIndex = 0;

                    _logger.Debug("Setting last search time to: {0}", baseSearchTime);

                    criteriaBase.Episodes.ForEach(e =>
                    {
                        e.LastSearchTime = baseSearchTime.AddMilliseconds(episodeIndex++);
                    });
                    _episodeService.UpdateLastSearchTime(criteriaBase.Episodes);
                }

                if (trackProgress)
                {
                    _searchProgressService.ReportRanking(searchId);
                }

                var decisions = _makeDownloadDecision.GetSearchDecision(reports, criteriaBase).ToList();

                if (trackProgress)
                {
                    _searchProgressService.Complete(searchId);
                }

                return decisions;
            }
            catch (Exception ex)
            {
                if (trackProgress)
                {
                    _searchProgressService.Fail(searchId, ex.Message);
                }

                throw;
            }
        }

        private async Task<IList<ReleaseInfo>> DispatchIndexer(Func<IIndexer, Task<IList<ReleaseInfo>>> searchAction,
                                                               IIndexer indexer,
                                                               SearchCriteriaBase criteriaBase,
                                                               string searchId,
                                                               int totalIndexers,
                                                               Func<int> incrementCompleted)
        {
            var trackProgress = criteriaBase.InteractiveSearch && searchId.IsNotNullOrWhiteSpace();

            try
            {
                var result = await searchAction(indexer);
                return result;
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Error while searching for {0}", criteriaBase);
            }
            finally
            {
                if (trackProgress)
                {
                    var completed = incrementCompleted();
                    _searchProgressService.ReportQuerying(searchId, indexer.Definition.Name, completed, totalIndexers);
                }
            }

            return Array.Empty<ReleaseInfo>();
        }

        private List<DownloadDecision> DeDupeDecisions(List<DownloadDecision> decisions)
        {
            return decisions.GroupBy(d => d.RemoteEpisode.Release.Guid)
                .Select(d => d.OrderBy(v => v.Rejections.Count()).ThenBy(v => v.RemoteEpisode?.Release?.IndexerPriority ?? IndexerDefinition.DefaultPriority).First())
                .ToList();
        }
    }
}

