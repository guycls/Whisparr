using System.Collections.Generic;
using System.Net;
using System.Text;
using FluentAssertions;
using Moq;
using NUnit.Framework;
using NzbDrone.Common.Http;
using NzbDrone.Common.Serializer;
using NzbDrone.Core.Configuration;
using NzbDrone.Core.MetadataSource.ThePornDb;
using NzbDrone.Core.Test.Framework;

namespace NzbDrone.Core.Test.MetadataSource.ThePornDb
{
    [TestFixture]
    public class TpdbSceneClientFixture : CoreTest<TpdbSceneClient>
    {
        private const string ApiKey = "test-api-key";
        private const string GraphQlUrl = "https://theporndb.net/graphql";

        [SetUp]
        public void Setup()
        {
            Mocker.GetMock<IConfigService>()
                .SetupGet(c => c.TpdbApiKey)
                .Returns(ApiKey);
        }

        [Test]
        public void should_return_null_when_api_key_not_set()
        {
            Mocker.GetMock<IConfigService>()
                .SetupGet(c => c.TpdbApiKey)
                .Returns(string.Empty);

            Subject.GetScreenshotUrl(3188328).Should().BeNull();
        }

        [Test]
        public void should_prefer_portrait_over_landscape_image()
        {
            var json = BuildGraphQlJson(new List<TpdbImage>
            {
                new TpdbImage { Url = "https://example.com/landscape.jpg", Width = 720, Height = 405 },
                new TpdbImage { Url = "https://example.com/poster.jpg", Width = 300, Height = 450 }
            });

            SetupHttpResponse(json);

            Subject.GetScreenshotUrl(3188328).Should().Be("https://example.com/poster.jpg");
        }

        [Test]
        public void should_use_first_image_when_no_portrait()
        {
            var json = BuildGraphQlJson(new List<TpdbImage>
            {
                new TpdbImage { Url = "https://example.com/image.jpg", Width = 720, Height = 405 }
            });

            SetupHttpResponse(json);

            Subject.GetScreenshotUrl(3188328).Should().Be("https://example.com/image.jpg");
        }

        [Test]
        public void should_set_authorization_header_and_post_to_graphql()
        {
            var json = BuildGraphQlJson(new List<TpdbImage>
            {
                new TpdbImage { Url = "https://example.com/poster.jpg", Width = 300, Height = 450 }
            });

            HttpRequest capturedRequest = null;

            Mocker.GetMock<IHttpClient>()
                .Setup(c => c.Post<TpdbGraphQlResponse>(It.IsAny<HttpRequest>()))
                .Callback<HttpRequest>(r => capturedRequest = r)
                .Returns<HttpRequest>(r => new HttpResponse<TpdbGraphQlResponse>(new HttpResponse(r, new HttpHeader(), json)));

            Subject.GetScreenshotUrl(3188328);

            capturedRequest.Should().NotBeNull();
            capturedRequest.Headers.GetSingleValue("Authorization").Should().Be("Bearer " + ApiKey);
            capturedRequest.Url.FullUri.Should().Be(GraphQlUrl);
            capturedRequest.Method.ToString().Should().Be("POST");
            var content = Encoding.UTF8.GetString(capturedRequest.ContentData);
            content.Should().Contain("findScene");
            content.Should().Contain("3188328");
        }

        [Test]
        public void should_return_null_on_http_error()
        {
            Mocker.GetMock<IHttpClient>()
                .Setup(c => c.Post<TpdbGraphQlResponse>(It.IsAny<HttpRequest>()))
                .Returns<HttpRequest>(r => new HttpResponse<TpdbGraphQlResponse>(
                    new HttpResponse(r, new HttpHeader(), string.Empty, HttpStatusCode.NotFound)));

            Subject.GetScreenshotUrl(3188328).Should().BeNull();
        }

        [Test]
        public void should_not_retry_on_401()
        {
            var callCount = 0;

            Mocker.GetMock<IHttpClient>()
                .Setup(c => c.Post<TpdbGraphQlResponse>(It.IsAny<HttpRequest>()))
                .Returns<HttpRequest>(r =>
                {
                    callCount++;
                    return new HttpResponse<TpdbGraphQlResponse>(
                        new HttpResponse(r, new HttpHeader(), string.Empty, HttpStatusCode.Unauthorized));
                });

            Subject.GetScreenshotUrl(3188328).Should().BeNull();
            callCount.Should().Be(1);
        }

        [Test]
        public void should_retry_after_429_using_retry_after_header()
        {
            var json = BuildGraphQlJson(new List<TpdbImage>
            {
                new TpdbImage { Url = "https://example.com/poster.jpg", Width = 300, Height = 450 }
            });

            var rateLimitedHeaders = new HttpHeader();
            rateLimitedHeaders.Set("Retry-After", "0");

            var callCount = 0;

            Mocker.GetMock<IHttpClient>()
                .Setup(c => c.Post<TpdbGraphQlResponse>(It.IsAny<HttpRequest>()))
                .Returns<HttpRequest>(r =>
                {
                    callCount++;

                    if (callCount == 1)
                    {
                        return new HttpResponse<TpdbGraphQlResponse>(
                            new HttpResponse(r, rateLimitedHeaders, string.Empty, HttpStatusCode.TooManyRequests));
                    }

                    return new HttpResponse<TpdbGraphQlResponse>(new HttpResponse(r, new HttpHeader(), json));
                });

            Subject.GetScreenshotUrl(3188328).Should().Be("https://example.com/poster.jpg");
            callCount.Should().Be(2);
        }

        private static string BuildGraphQlJson(List<TpdbImage> images)
        {
            return Json.ToJson(new TpdbGraphQlResponse
            {
                Data = new TpdbGraphQlData
                {
                    FindScene = new TpdbScene
                    {
                        Id = "3188328",
                        Images = images
                    }
                }
            });
        }

        private void SetupHttpResponse(string json)
        {
            Mocker.GetMock<IHttpClient>()
                .Setup(c => c.Post<TpdbGraphQlResponse>(It.IsAny<HttpRequest>()))
                .Returns<HttpRequest>(r => new HttpResponse<TpdbGraphQlResponse>(new HttpResponse(r, new HttpHeader(), json)));
        }
    }
}
