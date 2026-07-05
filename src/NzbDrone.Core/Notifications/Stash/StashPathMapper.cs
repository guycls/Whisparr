using NLog;
using NzbDrone.Common.Disk;
using NzbDrone.Common.Extensions;

namespace NzbDrone.Core.Notifications.Stash
{
    public static class StashPathMapper
    {
        public static string MapToStashPath(StashSettings settings, string whisparrPath, Logger logger = null)
        {
            if (settings.MapTo.IsNullOrWhiteSpace() || settings.MapFrom.IsNullOrWhiteSpace())
            {
                return whisparrPath;
            }

            var whisparrLocation = new OsPath(whisparrPath);
            var mapFrom = new OsPath(settings.MapFrom);

            if (!mapFrom.Contains(whisparrLocation))
            {
                return whisparrPath;
            }

            var mappedPath = new OsPath(settings.MapTo) + (whisparrLocation - mapFrom);

            logger?.Trace("Mapping path from {0} to {1} for Stash", whisparrLocation, mappedPath);

            return mappedPath.FullPath;
        }

        public static string MapFromStashPath(StashSettings settings, string stashPath, Logger logger = null)
        {
            if (settings.MapTo.IsNullOrWhiteSpace() || settings.MapFrom.IsNullOrWhiteSpace())
            {
                return stashPath;
            }

            var stashLocation = new OsPath(stashPath);
            var mapTo = new OsPath(settings.MapTo);

            if (!mapTo.Contains(stashLocation))
            {
                return stashPath;
            }

            var mappedPath = new OsPath(settings.MapFrom) + (stashLocation - mapTo);

            logger?.Trace("Mapping path from {0} to {1} for Whisparr", stashLocation, mappedPath);

            return mappedPath.FullPath;
        }
    }
}
