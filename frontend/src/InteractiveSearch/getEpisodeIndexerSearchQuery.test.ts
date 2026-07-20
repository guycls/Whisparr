import Episode from 'Episode/Episode';
import Series from 'Series/Series';
import getEpisodeIndexerSearchQuery from './getEpisodeIndexerSearchQuery';

function createSeries(overrides: Partial<Series> = {}): Series {
  return {
    id: 1,
    title: 'Test Studio',
    titleSlug: 'test-studio',
    studioSearchPrefix: 'TestPrefix',
    ...overrides,
  } as Series;
}

function createEpisode(overrides: Partial<Episode> = {}): Episode {
  return {
    id: 1,
    seriesId: 1,
    tvdbId: 1,
    episodeFileId: 0,
    seasonNumber: 1,
    episodeNumber: 1,
    releaseDate: '2021-03-15',
    airDate: '',
    actors: [],
    runtime: 60,
    overview: '',
    title: 'Scene Title',
    hasFile: false,
    monitored: true,
    unverifiedSceneNumbering: false,
    ...overrides,
  };
}

describe('getEpisodeIndexerSearchQuery', () => {
  it('returns empty string when series is missing', () => {
    expect(getEpisodeIndexerSearchQuery(undefined, createEpisode(), false)).toBe('');
  });

  it('returns empty string when episode is missing', () => {
    expect(getEpisodeIndexerSearchQuery(createSeries(), undefined, false)).toBe('');
  });

  it('uses title and studio prefix when ignoreSceneDate is true', () => {
    const query = getEpisodeIndexerSearchQuery(
      createSeries(),
      createEpisode(),
      true
    );

    expect(query).toBe('TestPrefix Scene Title');
  });

  it('uses title slug and releaseDate when ignoreSceneDate is false', () => {
    const query = getEpisodeIndexerSearchQuery(
      createSeries(),
      createEpisode({ releaseDate: '2021-03-15' }),
      false
    );

    expect(query).toBe('TestPrefix 21.03.15');
  });

  it('falls back to airDate when releaseDate is missing', () => {
    const query = getEpisodeIndexerSearchQuery(
      createSeries(),
      createEpisode({ releaseDate: undefined, airDate: '2019-07-04' }),
      false
    );

    expect(query).toBe('TestPrefix 19.07.04');
  });

  it('uses series title when studioSearchPrefix is missing and ignoreSceneDate is true', () => {
    const query = getEpisodeIndexerSearchQuery(
      createSeries({ studioSearchPrefix: undefined }),
      createEpisode(),
      true
    );

    expect(query).toBe('Test Studio Scene Title');
  });

  it('uses titleSlug when studioSearchPrefix is missing and ignoreSceneDate is false', () => {
    const query = getEpisodeIndexerSearchQuery(
      createSeries({ studioSearchPrefix: undefined }),
      createEpisode({ releaseDate: '2020-01-01' }),
      false
    );

    expect(query).toBe('test-studio 20.01.01');
  });
});
