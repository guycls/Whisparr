import _ from 'lodash';
import {
  filterEpisodesByRuntimeRange
} from 'Utilities/Number/runtimeFilterUtils';
import { filterEpisodesByQualityRange } from 'Utilities/Quality/qualityFilterTiers';

export function filterEpisodesByMonitorStatus(episodes, monitorStatusFilter) {
  if (monitorStatusFilter === 'monitored') {
    return episodes.filter((episode) => episode.monitored);
  }

  if (monitorStatusFilter === 'unmonitored') {
    return episodes.filter((episode) => !episode.monitored);
  }

  if (monitorStatusFilter === 'downloaded') {
    return episodes.filter((episode) => episode.hasFile);
  }

  if (monitorStatusFilter === 'missing') {
    return episodes.filter((episode) => episode.monitored && !episode.hasFile);
  }

  return episodes;
}

function getSeriesDetailsSelectableEpisodes({
  view,
  unifiedGridItems,
  sceneOrder,
  episodes,
  episodeFiles,
  seasons,
  monitorStatusFilter,
  qualityFilter,
  runtimeFilter,
  maxEpisodeRuntime
}) {
  if (view === 'unifiedGrid') {
    if (sceneOrder && sceneOrder.length) {
      return sceneOrder;
    }

    return unifiedGridItems || [];
  }

  const monitorFiltered = filterEpisodesByMonitorStatus(episodes || [], monitorStatusFilter);
  const qualityFiltered = filterEpisodesByQualityRange(
    monitorFiltered,
    episodeFiles || [],
    qualityFilter.minIndex,
    qualityFilter.maxIndex
  );
  const items = filterEpisodesByRuntimeRange(
    qualityFiltered,
    runtimeFilter.minMinutes,
    runtimeFilter.maxMinutes,
    maxEpisodeRuntime
  );
  const seasonNumbers = _.uniq([
    ...(seasons || []).map((season) => season.seasonNumber),
    ...items.map((episode) => episode.seasonNumber)
  ]).sort((left, right) => right - left);
  const grouped = _.groupBy(items, 'seasonNumber');

  return seasonNumbers.reduce((acc, seasonNumber) => {
    if (grouped[seasonNumber]) {
      acc.push(...grouped[seasonNumber]);
    }

    return acc;
  }, []);
}

export default getSeriesDetailsSelectableEpisodes;
