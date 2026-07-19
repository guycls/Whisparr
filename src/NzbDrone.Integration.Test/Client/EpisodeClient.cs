using System.Collections.Generic;
using RestSharp;
using Whisparr.Api.V3.Episodes;
using Whisparr.Http;

namespace NzbDrone.Integration.Test.Client
{
    public class EpisodeClient : ClientBase<EpisodeResource>
    {
        public EpisodeClient(IRestClient restClient, string apiKey)
            : base(restClient, apiKey, "episode")
        {
        }

        public List<EpisodeResource> GetEpisodesInSeries(int seriesId)
        {
            var request = BuildRequest("?seriesId=" + seriesId.ToString());
            return Get<List<EpisodeResource>>(request);
        }

        public PagingResource<EpisodeResource> GetEpisodesPaged(int seriesId, int pageNumber = 1, int pageSize = 25)
        {
            var request = BuildRequest("paged");
            request.AddParameter("seriesId", seriesId);
            request.AddParameter("page", pageNumber);
            request.AddParameter("pageSize", pageSize);
            request.AddParameter("sortKey", "episodes.airDateUtc");
            request.AddParameter("sortDirection", "descending");
            request.AddParameter("includeImages", true);

            return Get<PagingResource<EpisodeResource>>(request);
        }

        public EpisodeFilterBoundsResource GetFilterBounds(int seriesId)
        {
            var request = BuildRequest("filterBounds");
            request.AddParameter("seriesId", seriesId);

            return Get<EpisodeFilterBoundsResource>(request);
        }

        public EpisodeResource SetMonitored(EpisodeResource episode)
        {
            var request = BuildRequest(episode.Id.ToString());
            request.AddJsonBody(new { episode.Id, episode.Monitored });
            return Put<EpisodeResource>(request);
        }
    }
}
