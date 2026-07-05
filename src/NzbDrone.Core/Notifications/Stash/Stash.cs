using System.Collections.Generic;
using System.IO;
using FluentValidation.Results;
using NzbDrone.Common.Extensions;
using NzbDrone.Core.MediaFiles;
using NzbDrone.Core.Tv;

namespace NzbDrone.Core.Notifications.Stash
{
    public class Stash : NotificationBase<StashSettings>
    {
        private readonly IStashService _stashService;

        public Stash(IStashService stashService)
        {
            _stashService = stashService;
        }

        public override string Link => "https://stashapp.cc/";
        public override string Name => "Stash";

        public override void OnDownload(DownloadMessage message)
        {
            UpdatePath(GetEpisodeFilePath(message));
        }

        public override void OnRename(Series series, List<RenamedEpisodeFile> renamedFiles)
        {
            foreach (var renamedFile in renamedFiles)
            {
                UpdatePath(renamedFile.EpisodeFile?.Path);
            }
        }

        public override void OnEpisodeFileDelete(EpisodeDeleteMessage deleteMessage)
        {
            UpdatePath(deleteMessage.EpisodeFile?.Path);
        }

        public override void OnSeriesDelete(SeriesDeleteMessage deleteMessage)
        {
            UpdatePath(deleteMessage.Series?.Path);
        }

        public override ValidationResult Test()
        {
            var failures = new List<ValidationFailure>();

            failures.AddIfNotNull(_stashService.Test(Settings));

            return new ValidationResult(failures);
        }

        private void UpdatePath(string whisparrPath)
        {
            _stashService.Update(Settings, whisparrPath);
        }

        private static string GetEpisodeFilePath(DownloadMessage message)
        {
            if (message.EpisodeFile?.Path.IsNotNullOrWhiteSpace() == true)
            {
                return message.EpisodeFile.Path;
            }

            if (message.SourcePath.IsNotNullOrWhiteSpace())
            {
                return message.SourcePath;
            }

            if (message.EpisodeFile?.RelativePath.IsNotNullOrWhiteSpace() == true &&
                message.Series?.Path.IsNotNullOrWhiteSpace() == true)
            {
                return Path.Combine(message.Series.Path, message.EpisodeFile.RelativePath);
            }

            return null;
        }
    }
}
