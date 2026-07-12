import Episode from 'Episode/Episode';
import { EpisodeFile } from 'EpisodeFile/EpisodeFile';
import { QualitySource } from 'Quality/Quality';
import {
  filterEpisodesByQualityRange,
  getEpisodeQualityTierIndex,
  isFullQualityRange,
} from './qualityFilterTiers';

function createEpisode(overrides: Partial<Episode> = {}): Episode {
  return {
    id: 1,
    seriesId: 1,
    tvdbId: 1,
    episodeFileId: 0,
    seasonNumber: 1,
    episodeNumber: 1,
    airDate: '2020-01-01',
    actors: [],
    runtime: 60,
    overview: '',
    title: 'Test',
    hasFile: false,
    monitored: true,
    unverifiedSceneNumbering: false,
    ...overrides,
  };
}

function createEpisodeFile(overrides: Partial<EpisodeFile> = {}): EpisodeFile {
  return {
    id: 10,
    seriesId: 1,
    seasonNumber: 1,
    relativePath: 'test.mkv',
    path: '/test.mkv',
    size: 1000,
    dateAdded: '2020-01-01',
    sceneName: '',
    releaseGroup: '',
    languages: [],
    quality: {
      quality: {
        id: 4,
        name: 'HDTV-720p',
        resolution: 720,
        source: QualitySource.Television,
      },
      revision: { version: 1, real: 0, isRepack: false },
    },
    customFormats: [],
    customFormatScore: 0,
    indexerFlags: 0,
    mediaInfo: {},
    qualityCutoffNotMet: false,
    ...overrides,
  };
}

describe('qualityFilterTiers', () => {
  describe('getEpisodeQualityTierIndex', () => {
    it('returns unknown tier for episodes without files', () => {
      const episode = createEpisode({ hasFile: false, episodeFileId: 0 });
      expect(getEpisodeQualityTierIndex(episode, {})).toBe(0);
    });

    it('maps 480p resolution to tier 1', () => {
      const episodeFile = createEpisodeFile({
        quality: {
          quality: {
            id: 1,
            name: 'SDTV',
            resolution: 480,
            source: QualitySource.Television,
          },
          revision: { version: 1, real: 0, isRepack: false },
        },
      });
      const episode = createEpisode({ hasFile: true, episodeFileId: 10 });
      const lookup = { 10: episodeFile };

      expect(getEpisodeQualityTierIndex(episode, lookup)).toBe(1);
    });

    it('maps VR source to tier 6 even at 1080p resolution', () => {
      const episodeFile = createEpisodeFile({
        quality: {
          quality: {
            id: 22,
            name: 'VR',
            resolution: 1080,
            source: QualitySource.VR,
          },
          revision: { version: 1, real: 0, isRepack: false },
        },
      });
      const episode = createEpisode({ hasFile: true, episodeFileId: 10 });
      const lookup = { 10: episodeFile };

      expect(getEpisodeQualityTierIndex(episode, lookup)).toBe(6);
    });
  });

  describe('filterEpisodesByQualityRange', () => {
    const episodes = [
      createEpisode({ id: 1, title: 'Missing', hasFile: false }),
      createEpisode({ id: 2, title: '480p', hasFile: true, episodeFileId: 10 }),
      createEpisode({ id: 3, title: '576p', hasFile: true, episodeFileId: 11 }),
      createEpisode({ id: 4, title: '720p', hasFile: true, episodeFileId: 12 }),
      createEpisode({ id: 5, title: '1080p', hasFile: true, episodeFileId: 13 }),
      createEpisode({ id: 6, title: 'VR', hasFile: true, episodeFileId: 14 }),
    ];

    const episodeFiles = [
      createEpisodeFile({
        id: 10,
        quality: {
          quality: { id: 1, name: 'SDTV', resolution: 480, source: QualitySource.Television },
          revision: { version: 1, real: 0, isRepack: false },
        },
      }),
      createEpisodeFile({
        id: 11,
        quality: {
          quality: { id: 23, name: 'Bluray-576p', resolution: 576, source: QualitySource.Bluray },
          revision: { version: 1, real: 0, isRepack: false },
        },
      }),
      createEpisodeFile({
        id: 12,
        quality: {
          quality: { id: 4, name: 'HDTV-720p', resolution: 720, source: QualitySource.Television },
          revision: { version: 1, real: 0, isRepack: false },
        },
      }),
      createEpisodeFile({
        id: 13,
        quality: {
          quality: { id: 7, name: 'Bluray-1080p', resolution: 1080, source: QualitySource.Bluray },
          revision: { version: 1, real: 0, isRepack: false },
        },
      }),
      createEpisodeFile({
        id: 14,
        quality: {
          quality: { id: 22, name: 'VR', resolution: 1080, source: QualitySource.VR },
          revision: { version: 1, real: 0, isRepack: false },
        },
      }),
    ];

    it('returns all episodes for full range', () => {
      expect(isFullQualityRange(0, 6)).toBe(true);
      expect(filterEpisodesByQualityRange(episodes, episodeFiles, 0, 6)).toHaveLength(6);
    });

    it('includes 480p through 720p inclusively for range [1, 3]', () => {
      const filtered = filterEpisodesByQualityRange(episodes, episodeFiles, 1, 3);
      const titles = filtered.map((e) => e.title);

      expect(titles).toEqual(['480p', '576p', '720p']);
    });

    it('excludes VR from 1080p-2160p range [4, 5]', () => {
      const filtered = filterEpisodesByQualityRange(episodes, episodeFiles, 4, 5);
      const titles = filtered.map((e) => e.title);

      expect(titles).toEqual(['1080p']);
    });

    it('returns only unknown episodes for range [0, 0]', () => {
      const filtered = filterEpisodesByQualityRange(episodes, episodeFiles, 0, 0);
      const titles = filtered.map((e) => e.title);

      expect(titles).toEqual(['Missing']);
    });
  });
});
