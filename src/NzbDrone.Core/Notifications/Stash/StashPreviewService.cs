using System;
using System.Linq;
using NzbDrone.Common.Disk;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.MediaFiles;
using NzbDrone.Core.Tv;

namespace NzbDrone.Core.Notifications.Stash
{
    public interface IStashPreviewService
    {
        string GetPreviewPath(int episodeId);
    }

    public class StashPreviewService : IStashPreviewService
    {
        private readonly INotificationFactory _notificationFactory;
        private readonly IEpisodeService _episodeService;
        private readonly IMediaFileService _mediaFileService;
        private readonly IDiskProvider _diskProvider;

        public StashPreviewService(INotificationFactory notificationFactory,
                                   IEpisodeService episodeService,
                                   IMediaFileService mediaFileService,
                                   IDiskProvider diskProvider)
        {
            _notificationFactory = notificationFactory;
            _episodeService = episodeService;
            _mediaFileService = mediaFileService;
            _diskProvider = diskProvider;
        }

        public string GetPreviewPath(int episodeId)
        {
            var settings = GetStashSettings();

            if (settings == null || settings.GeneratedFolder.IsNullOrWhiteSpace())
            {
                return null;
            }

            var episode = _episodeService.FindEpisodes(new[] { episodeId }).FirstOrDefault();

            if (episode == null || episode.EpisodeFileId <= 0)
            {
                return null;
            }

            var episodeFile = _mediaFileService.Find(episode.EpisodeFileId);
            var previewPath = StashPreviewPath.Build(settings.GeneratedFolder, episodeFile?.OsHash);

            if (previewPath.IsNullOrWhiteSpace() || !_diskProvider.FileExists(previewPath))
            {
                return null;
            }

            return previewPath;
        }

        private StashSettings GetStashSettings()
        {
            var definition = _notificationFactory.All()
                .FirstOrDefault(n => n.Implementation.Equals("Stash", StringComparison.InvariantCultureIgnoreCase));

            if (definition?.Settings is not StashSettings settings || !settings.IsValid)
            {
                return null;
            }

            return settings;
        }
    }
}
