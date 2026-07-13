using System;
using NzbDrone.Common.Cache;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.IndexerSearch.Definitions;
using NzbDrone.Core.Localization;

namespace NzbDrone.Core.IndexerSearch
{
    public interface ISearchProgressService
    {
        void Start(string searchId);
        void ReportPreparing(string searchId, SearchCriteriaBase criteria, int indexerCount);
        void ReportQuerying(string searchId, string indexerName, int completedIndexers, int totalIndexers);
        void ReportAggregating(string searchId, int releaseCount);
        void ReportRanking(string searchId);
        void Complete(string searchId);
        void Fail(string searchId, string error);
        SearchProgress Get(string searchId);
        void Clear(string searchId);
    }

    public class SearchProgressService : ISearchProgressService
    {
        private static readonly TimeSpan CacheTtl = TimeSpan.FromMinutes(2);

        private readonly ICached<SearchProgress> _cache;
        private readonly ILocalizationService _localizationService;

        public SearchProgressService(ICacheManager cacheManager, ILocalizationService localizationService)
        {
            _cache = cacheManager.GetCache<SearchProgress>(GetType());
            _localizationService = localizationService;
        }

        public void Start(string searchId)
        {
            if (searchId.IsNullOrWhiteSpace())
            {
                return;
            }

            Update(searchId, new SearchProgress
            {
                Phase = "starting",
                Message = _localizationService.GetLocalizedString("InteractiveSearchStatusStarting")
            });
        }

        public void ReportPreparing(string searchId, SearchCriteriaBase criteria, int indexerCount)
        {
            if (searchId.IsNullOrWhiteSpace())
            {
                return;
            }

            var message = GetPreparingMessage(criteria, indexerCount);

            Update(searchId, new SearchProgress
            {
                Phase = "preparing",
                Message = message,
                IndexerCount = indexerCount
            });
        }

        public void ReportQuerying(string searchId, string indexerName, int completedIndexers, int totalIndexers)
        {
            if (searchId.IsNullOrWhiteSpace())
            {
                return;
            }

            var template = _localizationService.GetLocalizedString("InteractiveSearchStatusQueryingIndexer");
            var message = string.Format(template, indexerName, completedIndexers, totalIndexers);

            Update(searchId, new SearchProgress
            {
                Phase = "querying",
                Message = message,
                IndexerCount = totalIndexers,
                CompletedIndexers = completedIndexers
            });
        }

        public void ReportAggregating(string searchId, int releaseCount)
        {
            if (searchId.IsNullOrWhiteSpace())
            {
                return;
            }

            var template = _localizationService.GetLocalizedString("InteractiveSearchStatusEvaluatingReleases");
            var message = string.Format(template, releaseCount);

            Update(searchId, new SearchProgress
            {
                Phase = "aggregating",
                Message = message,
                ReleaseCount = releaseCount
            });
        }

        public void ReportRanking(string searchId)
        {
            if (searchId.IsNullOrWhiteSpace())
            {
                return;
            }

            Update(searchId, new SearchProgress
            {
                Phase = "ranking",
                Message = _localizationService.GetLocalizedString("InteractiveSearchStatusRankingResults")
            });
        }

        public void Complete(string searchId)
        {
            if (searchId.IsNullOrWhiteSpace())
            {
                return;
            }

            var progress = Get(searchId) ?? new SearchProgress();

            progress.Phase = "completed";
            progress.IsComplete = true;
            _cache.Set(searchId, progress, CacheTtl);
        }

        public void Fail(string searchId, string error)
        {
            if (searchId.IsNullOrWhiteSpace())
            {
                return;
            }

            Update(searchId, new SearchProgress
            {
                Phase = "failed",
                IsComplete = true,
                Error = error,
                Message = error
            });
        }

        public SearchProgress Get(string searchId)
        {
            if (searchId.IsNullOrWhiteSpace())
            {
                return null;
            }

            return _cache.Find(searchId);
        }

        public void Clear(string searchId)
        {
            if (searchId.IsNullOrWhiteSpace())
            {
                return;
            }

            _cache.Remove(searchId);
        }

        private string GetPreparingMessage(SearchCriteriaBase criteria, int indexerCount)
        {
            if (criteria is SingleEpisodeSearchCriteria episodeCriteria)
            {
                var target = episodeCriteria.EpisodeTitle.IsNotNullOrWhiteSpace()
                    ? episodeCriteria.EpisodeTitle
                    : criteria.Series?.Title;

                var template = _localizationService.GetLocalizedString("InteractiveSearchStatusSearchingEpisode");
                return string.Format(template, indexerCount, target);
            }

            if (criteria is SeasonSearchCriteria seasonCriteria)
            {
                var template = _localizationService.GetLocalizedString("InteractiveSearchStatusSearchingSeason");
                return string.Format(template, indexerCount, seasonCriteria.Year);
            }

            if (criteria is SiteRipSearchCriteria)
            {
                var template = _localizationService.GetLocalizedString("SiteRipSearchStatusSearching");
                return string.Format(template, indexerCount, criteria.Series?.Title);
            }

            var fallbackTemplate = _localizationService.GetLocalizedString("InteractiveSearchStatusSearchingEpisode");
            return string.Format(fallbackTemplate, indexerCount, criteria.Series?.Title);
        }

        private void Update(string searchId, SearchProgress progress)
        {
            _cache.Set(searchId, progress, CacheTtl);
        }
    }
}
