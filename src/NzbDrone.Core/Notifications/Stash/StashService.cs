using System;
using System.Net;
using FluentValidation.Results;
using NLog;
using NzbDrone.Common.Extensions;
using NzbDrone.Common.Http;
namespace NzbDrone.Core.Notifications.Stash
{
    public interface IStashService
    {
        void GetStatus(StashSettings settings);
        void Update(StashSettings settings, string whisparrPath);
        ValidationFailure Test(StashSettings settings);
    }

    public class StashService : IStashService
    {
        private readonly StashProxy _proxy;
        private readonly Logger _logger;

        public StashService(StashProxy proxy, Logger logger)
        {
            _proxy = proxy;
            _logger = logger;
        }

        public void Update(StashSettings settings, string whisparrPath)
        {
            if (whisparrPath.IsNullOrWhiteSpace())
            {
                _logger.Debug("Skipping Stash update for empty path");
                return;
            }

            var mappedPath = StashPathMapper.MapToStashPath(settings, whisparrPath, _logger);

            _proxy.Update(settings, mappedPath);
        }

        public void GetStatus(StashSettings settings)
        {
            _proxy.GetStatus(settings);
        }

        public ValidationFailure Test(StashSettings settings)
        {
            try
            {
                _logger.Debug("Testing connection to Stash: {0}", settings.Address);

                GetStatus(settings);
            }
            catch (HttpException ex)
            {
                if (ex.Response.StatusCode == HttpStatusCode.Unauthorized)
                {
                    return new ValidationFailure("ApiKey", "API Key is incorrect");
                }

                return new ValidationFailure("Host", "Unable to send test message: " + ex.Message);
            }
            catch (Exception ex)
            {
                _logger.Error(ex, "Unable to send test message");
                return new ValidationFailure("Host", "Unable to send test message: " + ex.Message);
            }

            return null;
        }
    }
}
