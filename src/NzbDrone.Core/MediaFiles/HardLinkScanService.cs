using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using NLog;
using NzbDrone.Common.Disk;
using NzbDrone.Common.Extensions;
using NzbDrone.Common.Instrumentation.Extensions;
using NzbDrone.Core.Tv;

namespace NzbDrone.Core.MediaFiles
{
    public interface IHardLinkScanService
    {
        void UpdateHardLinks(IEnumerable<Series> series);
    }

    public class HardLinkScanService : IHardLinkScanService
    {
        private readonly IDiskProvider _diskProvider;
        private readonly ISeriesService _seriesService;
        private readonly IMediaFileService _mediaFileService;
        private readonly IEpisodeFileHardLinkRepository _hardLinkRepository;
        private readonly Logger _logger;

        public HardLinkScanService(IDiskProvider diskProvider,
                                   ISeriesService seriesService,
                                   IMediaFileService mediaFileService,
                                   IEpisodeFileHardLinkRepository hardLinkRepository,
                                   Logger logger)
        {
            _diskProvider = diskProvider;
            _seriesService = seriesService;
            _mediaFileService = mediaFileService;
            _hardLinkRepository = hardLinkRepository;
            _logger = logger;
        }

        public void UpdateHardLinks(IEnumerable<Series> series)
        {
            var mounts = new List<IMount>();

            foreach (var seriesItem in series ?? Enumerable.Empty<Series>())
            {
                if (seriesItem == null || seriesItem.Path.IsNullOrWhiteSpace())
                {
                    continue;
                }

                IMount mount = null;

                try
                {
                    mount = _diskProvider.GetMount(seriesItem.Path);
                }
                catch (Exception ex)
                {
                    _logger.Debug(ex, "Unable to resolve mount for {0}", seriesItem.Path);
                }

                if (mount == null || mount.RootDirectory.IsNullOrWhiteSpace())
                {
                    _logger.Debug("No mount for {0}, skipping hard link scan", seriesItem.Path);
                    continue;
                }

                if (mounts.Any(existing => existing.RootDirectory.PathEquals(mount.RootDirectory)))
                {
                    continue;
                }

                mounts.Add(mount);
            }

            if (mounts.Count == 0)
            {
                return;
            }

            var allSeries = _seriesService.GetAllSeries();

            foreach (var mount in mounts)
            {
                _logger.ProgressInfo("Indexing hard links on {0}", mount.RootDirectory);

                var index = BuildIndex(mount.RootDirectory);
                var seriesOnMount = allSeries.Where(item => IsOnMount(item.Path, mount.RootDirectory)).ToList();

                foreach (var seriesOnMountItem in seriesOnMount)
                {
                    UpdateSeriesFiles(seriesOnMountItem, index);
                }
            }
        }

        private Dictionary<string, List<string>> BuildIndex(string mountRoot)
        {
            var index = new Dictionary<string, List<string>>();
            var rootIdentity = _diskProvider.GetFileLinkIdentity(mountRoot);
            var rootVolume = rootIdentity?.VolumeId;
            var pending = new Stack<string>();
            pending.Push(mountRoot);

            while (pending.Count > 0)
            {
                var directory = pending.Pop();
                List<string> files;
                List<string> directories;

                try
                {
                    files = _diskProvider.GetFiles(directory, false).ToList();
                    directories = _diskProvider.GetDirectories(directory).ToList();
                }
                catch (Exception ex)
                {
                    _logger.Debug(ex, "Unable to read {0} while indexing hard links", directory);
                    continue;
                }

                foreach (var file in files)
                {
                    var identity = _diskProvider.GetFileLinkIdentity(file);

                    if (identity == null || identity.LinkCount <= 1 || identity.VolumeId.IsNullOrWhiteSpace() || identity.FileId.IsNullOrWhiteSpace())
                    {
                        continue;
                    }

                    if (!index.TryGetValue(identity.Key, out var paths))
                    {
                        paths = new List<string>();
                        index[identity.Key] = paths;
                    }

                    if (!paths.Any(path => path.PathEquals(file)))
                    {
                        paths.Add(file);
                    }
                }

                foreach (var child in directories)
                {
                    var identity = _diskProvider.GetFileLinkIdentity(child);

                    if (identity == null)
                    {
                        continue;
                    }

                    if (rootVolume.IsNotNullOrWhiteSpace() && identity.VolumeId != rootVolume)
                    {
                        continue;
                    }

                    pending.Push(child);
                }
            }

            return index;
        }

        private void UpdateSeriesFiles(Series series, Dictionary<string, List<string>> index)
        {
            if (series == null || series.Path.IsNullOrWhiteSpace())
            {
                return;
            }

            foreach (var file in _mediaFileService.GetFilesBySeries(series.Id))
            {
                var fullPath = Path.Combine(series.Path, file.RelativePath ?? string.Empty);
                var identity = _diskProvider.GetFileLinkIdentity(fullPath);

                if (identity == null || identity.VolumeId.IsNullOrWhiteSpace() || identity.FileId.IsNullOrWhiteSpace())
                {
                    continue;
                }

                List<string> paths;

                if (identity.LinkCount <= 1)
                {
                    paths = new List<string> { fullPath };
                }
                else if (index.TryGetValue(identity.Key, out var linked))
                {
                    paths = linked.ToList();

                    if (!paths.Any(path => path.PathEquals(fullPath)))
                    {
                        paths.Add(fullPath);
                    }
                }
                else
                {
                    _logger.Debug("Hard link index missed {0}", fullPath);
                    paths = new List<string> { fullPath };
                }

                file.HardLinkVolumeId = identity.VolumeId;
                file.HardLinkFileId = identity.FileId;
                _mediaFileService.SetHardLinkIdentity(file);
                _hardLinkRepository.ReplacePaths(file.Id, paths);
            }
        }

        private static bool IsOnMount(string path, string mountRoot)
        {
            if (path.IsNullOrWhiteSpace() || mountRoot.IsNullOrWhiteSpace())
            {
                return false;
            }

            return path.PathEquals(mountRoot) || mountRoot.IsParentPath(path);
        }
    }
}
