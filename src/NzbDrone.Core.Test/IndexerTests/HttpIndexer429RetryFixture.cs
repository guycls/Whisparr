using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Common.Http;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.Indexers;
using NzbDrone.Core.IndexerSearch.Definitions;
using NzbDrone.Core.Parser;
using NzbDrone.Core.Parser.Model;
using NzbDrone.Core.Tv;
using NzbDrone.Test.Common;

namespace NzbDrone.Core.Test.IndexerTests
{
    [TestFixture]
    public class HttpIndexer429RetryFixture : TestBase<RetryableTestIndexer>
    {
        private HttpRequest _request;
        private HttpResponse _rateLimitResponse;
        private HttpResponse _successResponse;

        [SetUp]
        public void Setup()
        {
            Subject.Definition = new IndexerDefinition { Id = 1, Name = "Test" };

            _request = new HttpRequest("http://my.feed.local/", HttpAccept.Rss) { Method = HttpMethod.Get };
            _rateLimitResponse = new HttpResponse(_request, new HttpHeader(), Array.Empty<byte>(), (HttpStatusCode)429);
            _rateLimitResponse.Headers["Retry-After"] = "30";
            _successResponse = new HttpResponse(_request, new HttpHeader(), "<xml></xml>");

            var requestGenerator = Mocker.GetMock<IIndexerRequestGenerator>();
            Subject._requestGenerator = requestGenerator.Object;

            var pageable = new IndexerPageableRequestChain();
            pageable.Add(new List<IndexerRequest> { new IndexerRequest("http://my.feed.local/", HttpAccept.Rss) { HttpRequest = { Method = HttpMethod.Get } } });
            requestGenerator.Setup(s => s.GetSearchRequests(It.IsAny<SeasonSearchCriteria>()))
                .Returns(pageable);

            var parser = Mocker.GetMock<IParseIndexerResponse>();
            Subject._parser = parser.Object;
            parser.Setup(s => s.ParseResponse(It.IsAny<IndexerResponse>()))
                  .Returns(new List<ReleaseInfo> { new ReleaseInfo { Title = "Test Release", DownloadUrl = "http://download.local/test" } });
        }

        [Test]
        public async Task should_retry_and_succeed_when_429_then_success()
        {
            var callCount = 0;
            Mocker.GetMock<IHttpClient>()
                .Setup(o => o.ExecuteAsync(It.IsAny<HttpRequest>()))
                .Returns(() =>
                {
                    callCount++;
                    if (callCount == 1)
                    {
                        throw new TooManyRequestsException(_request, _rateLimitResponse);
                    }

                    return Task.FromResult(_successResponse);
                });

            var releases = await Subject.Fetch(new SeasonSearchCriteria
            {
                Series = new Series { Title = "Test" },
                SceneTitles = new List<string> { "Test" }
            });

            releases.Should().HaveCount(1);
            callCount.Should().Be(2);
            Subject.RetryDelays.Should().ContainSingle().Which.Should().Be(TimeSpan.FromSeconds(30));
            Mocker.GetMock<IIndexerStatusService>().Verify(v => v.RecordFailure(It.IsAny<int>(), It.IsAny<TimeSpan>()), Times.Never());
        }

        [Test]
        public async Task should_disable_indexer_after_max_retries_exhausted()
        {
            Mocker.GetMock<IHttpClient>()
                .Setup(o => o.ExecuteAsync(It.IsAny<HttpRequest>()))
                .Throws(new TooManyRequestsException(_request, _rateLimitResponse));

            var releases = await Subject.Fetch(new SeasonSearchCriteria
            {
                Series = new Series { Title = "Test" },
                SceneTitles = new List<string> { "Test" }
            });

            releases.Should().BeEmpty();
            Mocker.GetMock<IHttpClient>().Verify(v => v.ExecuteAsync(It.IsAny<HttpRequest>()), Times.Exactly(4));
            Subject.RetryDelays.Should().HaveCount(3);
            Mocker.GetMock<IIndexerStatusService>()
                  .Verify(v => v.RecordFailure(1, TimeSpan.FromSeconds(30)), Times.Once());
        }
    }

    public class RetryableTestIndexer : TestIndexer
    {
        public List<TimeSpan> RetryDelays { get; } = new List<TimeSpan>();

        public RetryableTestIndexer(IHttpClient httpClient, IIndexerStatusService indexerStatusService, IConfigService configService, IParsingService parsingService, NLog.Logger logger)
            : base(httpClient, indexerStatusService, configService, parsingService, logger)
        {
        }

        protected override Task WaitFor429RetryAsync(TimeSpan retryAfter)
        {
            RetryDelays.Add(retryAfter);
            return Task.CompletedTask;
        }
    }
}
