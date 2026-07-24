import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import AppState from 'App/State/AppState';
import Episode from 'Episode/Episode';

interface SiteRipSeriesEpisodesResult {
  episodes: Episode[];
  isFullyLoaded: boolean;
  isLoading: boolean;
  usesUnifiedGrid: boolean;
  loadedCount: number;
  totalCount: number;
  loadError: unknown;
}

export function useSiteRipSeriesEpisodes(
  seriesId: number
): SiteRipSeriesEpisodesResult {
  const episodes = useSelector((state: AppState) => state.episodes.items);
  const unifiedGrid = useSelector(
    (state: AppState) => state.seriesDetails.unifiedGrid
  );
  const activeSeriesId = useSelector(
    (state: AppState) => state.seriesDetails.activeSeriesId
  );

  return useMemo(() => {
    const fromEpisodes = episodes.filter(
      (episode) => episode.seriesId === seriesId
    );

    if (fromEpisodes.length > 0) {
      return {
        episodes: fromEpisodes,
        isFullyLoaded: true,
        isLoading: false,
        usesUnifiedGrid: false,
        loadedCount: fromEpisodes.length,
        totalCount: fromEpisodes.length,
        loadError: null,
      };
    }

    const usesUnifiedGrid = activeSeriesId === seriesId;

    if (!usesUnifiedGrid) {
      return {
        episodes: [],
        isFullyLoaded: false,
        isLoading: false,
        usesUnifiedGrid: false,
        loadedCount: 0,
        totalCount: 0,
        loadError: null,
      };
    }

    const { isPopulated, items, totalRecords, error: loadError } = unifiedGrid;
    const isFullyLoaded =
      isPopulated && (totalRecords === 0 || items.length >= totalRecords);
    const isLoading = !isFullyLoaded && !loadError;

    return {
      episodes: isPopulated ? items : [],
      isFullyLoaded,
      isLoading,
      usesUnifiedGrid: true,
      loadedCount: items.length,
      totalCount: totalRecords,
      loadError,
    };
  }, [episodes, unifiedGrid, activeSeriesId, seriesId]);
}

export function useSiteRipEpisode(seriesId: number, episodeId?: number) {
  const { episodes } = useSiteRipSeriesEpisodes(seriesId);

  return useMemo(() => {
    if (!episodeId) {
      return undefined;
    }

    return episodes.find((episode) => episode.id === episodeId);
  }, [episodes, episodeId]);
}
