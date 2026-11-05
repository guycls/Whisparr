import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import AppState from 'App/State/AppState';

export type EpisodeEntities =
  | 'calendar'
  | 'episodes'
  | 'interactiveImport.episodes'
  | 'seriesDetails.unifiedGrid'
  | 'wanted.cutoffUnmet'
  | 'wanted.missing';

function createEpisodeSelector(episodeId?: number) {
  return createSelector(
    (state: AppState) => state.episodes.items,
    (episodes) => {
      return episodes.find(({ id }) => id === episodeId);
    }
  );
}

function createCalendarEpisodeSelector(episodeId?: number) {
  return createSelector(
    (state: AppState) => state.calendar.items,
    (episodes) => {
      return episodes.find(({ id }) => id === episodeId);
    }
  );
}

function createWantedCutoffUnmetEpisodeSelector(episodeId?: number) {
  return createSelector(
    (state: AppState) => state.wanted.cutoffUnmet.items,
    (episodes) => {
      return episodes.find(({ id }) => id === episodeId);
    }
  );
}

function createWantedMissingEpisodeSelector(episodeId?: number) {
  return createSelector(
    (state: AppState) => state.wanted.missing.items,
    (episodes) => {
      return episodes.find(({ id }) => id === episodeId);
    }
  );
}

function createUnifiedGridEpisodeSelector(episodeId?: number) {
  return createSelector(
    (state: AppState) => state.seriesDetails.unifiedGrid.windowPages,
    (state: AppState) => state.seriesDetails.unifiedGrid.items,
    (windowPages, episodes) => {
      const pages = windowPages || {};

      for (const page of Object.keys(pages)) {
        const match = pages[Number(page)]?.find(
          (episode) => episode.id === episodeId
        );

        if (match) {
          return match;
        }
      }

      return episodes.find(({ id }) => id === episodeId);
    }
  );
}

function useEpisode(
  episodeId: number | undefined,
  episodeEntity: EpisodeEntities
) {
  let selector = createEpisodeSelector;

  switch (episodeEntity) {
    case 'calendar':
      selector = createCalendarEpisodeSelector;
      break;
    case 'wanted.cutoffUnmet':
      selector = createWantedCutoffUnmetEpisodeSelector;
      break;
    case 'wanted.missing':
      selector = createWantedMissingEpisodeSelector;
      break;
    default:
      break;
  }

  const episodeSelector =
    episodeEntity === 'seriesDetails.unifiedGrid'
      ? createUnifiedGridEpisodeSelector(episodeId)
      : selector(episodeId);

  return useSelector(episodeSelector);
}

export default useEpisode;
