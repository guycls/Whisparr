import {
  filterEpisodesByRuntimeRange,
  formatRuntimeFilterLabel,
  isFullRuntimeRange,
  resolveRuntimeFilter,
  roundRuntimeMax,
} from './runtimeFilterUtils';

describe('runtimeFilterUtils', () => {
  describe('roundRuntimeMax', () => {
    it('returns 0 for zero or negative input', () => {
      expect(roundRuntimeMax(0)).toBe(0);
      expect(roundRuntimeMax(-5)).toBe(0);
    });

    it('rounds up to nearest multiple of 10', () => {
      expect(roundRuntimeMax(45)).toBe(50);
      expect(roundRuntimeMax(50)).toBe(50);
      expect(roundRuntimeMax(51)).toBe(60);
    });
  });

  describe('filterEpisodesByRuntimeRange', () => {
    const episodes = [
      { id: 1, runtime: 0 },
      { id: 2, runtime: 30 },
      { id: 3, runtime: 60 },
      { id: 4, runtime: 90 },
    ];

    it('returns all episodes for full range', () => {
      expect(isFullRuntimeRange(0, null, 90)).toBe(true);
      expect(filterEpisodesByRuntimeRange(episodes, 0, null, 90)).toHaveLength(4);
    });

    it('filters episodes within runtime range', () => {
      const filtered = filterEpisodesByRuntimeRange(episodes, 30, 60, 90);
      const ids = filtered.map((episode) => episode.id);

      expect(ids).toEqual([2, 3]);
    });

    it('returns all episodes when series max runtime is not yet known', () => {
      expect(filterEpisodesByRuntimeRange(episodes, 30, 60, 0)).toHaveLength(4);
    });

    it('treats unknown runtime as 0', () => {
      const filtered = filterEpisodesByRuntimeRange(episodes, 0, 0, 90);
      const ids = filtered.map((episode) => episode.id);

      expect(ids).toEqual([1]);
    });
  });

  describe('resolveRuntimeFilter', () => {
    it('clamps persisted values to series max', () => {
      expect(resolveRuntimeFilter({ minMinutes: 0, maxMinutes: 120 }, 90)).toEqual({
        minMinutes: 0,
        maxMinutes: null,
      });
    });
  });

  describe('formatRuntimeFilterLabel', () => {
    it('returns Unknown for 0', () => {
      expect(formatRuntimeFilterLabel(0)).toBe('SeriesDetailsRuntimeFilterUnknown');
    });
  });
});
