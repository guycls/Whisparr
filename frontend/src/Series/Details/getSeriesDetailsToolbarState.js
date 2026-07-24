export function getSeriesDetailsToolbarState({
  episodeItems,
  episodeFileItems,
  statistics = {}
}) {
  const {
    totalEpisodeCount = 0,
    episodeCount = 0,
    episodeFileCount = 0
  } = statistics;

  const hasEpisodesFromState = !!episodeItems.length;
  const hasMonitoredEpisodesFromState = episodeItems.some((episode) => episode.monitored);
  const hasEpisodeFilesFromState = !!episodeFileItems.length;

  return {
    hasEpisodes: hasEpisodesFromState || totalEpisodeCount > 0,
    hasMonitoredEpisodes: hasMonitoredEpisodesFromState || episodeCount > 0,
    hasEpisodeFiles: hasEpisodeFilesFromState || episodeFileCount > 0
  };
}
