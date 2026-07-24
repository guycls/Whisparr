import { getSeriesDetailsToolbarState } from './getSeriesDetailsToolbarState';

describe('getSeriesDetailsToolbarState', () => {
  it('uses statistics when episode state is empty (unified grid)', () => {
    const result = getSeriesDetailsToolbarState({
      episodeItems: [],
      episodeFileItems: [],
      statistics: { totalEpisodeCount: 2509 }
    });

    expect(result.hasEpisodes).toBe(true);
    expect(result.hasMonitoredEpisodes).toBe(false);
    expect(result.hasEpisodeFiles).toBe(false);
  });

  it('uses episode state when items are populated (list/grid)', () => {
    const result = getSeriesDetailsToolbarState({
      episodeItems: [{ id: 1, monitored: true }],
      episodeFileItems: [{ id: 1 }],
      statistics: {
        totalEpisodeCount: 0,
        episodeCount: 0,
        episodeFileCount: 0
      }
    });

    expect(result.hasEpisodes).toBe(true);
    expect(result.hasMonitoredEpisodes).toBe(true);
    expect(result.hasEpisodeFiles).toBe(true);
  });

  it('returns all false for an empty site', () => {
    const result = getSeriesDetailsToolbarState({
      episodeItems: [],
      episodeFileItems: [],
      statistics: {
        totalEpisodeCount: 0,
        episodeCount: 0,
        episodeFileCount: 0
      }
    });

    expect(result.hasEpisodes).toBe(false);
    expect(result.hasMonitoredEpisodes).toBe(false);
    expect(result.hasEpisodeFiles).toBe(false);
  });

  it('falls back to statistics.episodeCount for monitored episodes', () => {
    const result = getSeriesDetailsToolbarState({
      episodeItems: [],
      episodeFileItems: [],
      statistics: { episodeCount: 3 }
    });

    expect(result.hasMonitoredEpisodes).toBe(true);
  });

  it('falls back to statistics.episodeFileCount for episode files', () => {
    const result = getSeriesDetailsToolbarState({
      episodeItems: [],
      episodeFileItems: [],
      statistics: { episodeFileCount: 10 }
    });

    expect(result.hasEpisodeFiles).toBe(true);
  });
});
