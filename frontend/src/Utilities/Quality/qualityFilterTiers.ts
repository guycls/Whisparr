import Episode from 'Episode/Episode';
import { EpisodeFile } from 'EpisodeFile/EpisodeFile';
import { QualitySource } from 'Quality/Quality';

export interface QualityFilterTier {
  index: number;
  label: string;
  resolution?: number;
  isUnknown?: boolean;
  isVr?: boolean;
}

export const QUALITY_FILTER_TIERS: QualityFilterTier[] = [
  { index: 0, label: 'Unknown', isUnknown: true },
  { index: 1, label: '480p', resolution: 480 },
  { index: 2, label: '576p', resolution: 576 },
  { index: 3, label: '720p', resolution: 720 },
  { index: 4, label: '1080p', resolution: 1080 },
  { index: 5, label: '2160p', resolution: 2160 },
  { index: 6, label: 'VR', isVr: true },
];

export const QUALITY_FILTER_MAX_INDEX = QUALITY_FILTER_TIERS.length - 1;

const RESOLUTION_TIER_INDEX: Record<number, number> = {
  480: 1,
  576: 2,
  720: 3,
  1080: 4,
  2160: 5,
};

export function formatQualityTierLabel(tier: QualityFilterTier): string {
  return tier.label;
}

export function getQualityFilterTier(index: number): QualityFilterTier {
  return QUALITY_FILTER_TIERS[index] ?? QUALITY_FILTER_TIERS[0];
}

export function isFullQualityRange(minIndex: number, maxIndex: number): boolean {
  return minIndex === 0 && maxIndex === QUALITY_FILTER_MAX_INDEX;
}

export function getEpisodeQualityTierIndex(
  episode: Episode,
  episodeFileById: Record<number, EpisodeFile | undefined>
): number {
  if (!episode.hasFile || !episode.episodeFileId) {
    return 0;
  }

  const episodeFile = episodeFileById[episode.episodeFileId];

  if (!episodeFile?.quality?.quality) {
    return 0;
  }

  const { quality } = episodeFile.quality;

  if (quality.source === QualitySource.VR) {
    return 6;
  }

  if (!quality.resolution) {
    return 0;
  }

  return RESOLUTION_TIER_INDEX[quality.resolution] ?? 0;
}

export function filterEpisodesByQualityRange<T extends Episode>(
  episodes: T[],
  episodeFiles: EpisodeFile[],
  minIndex: number,
  maxIndex: number
): T[] {
  if (isFullQualityRange(minIndex, maxIndex)) {
    return episodes;
  }

  const episodeFileById = episodeFiles.reduce<Record<number, EpisodeFile>>(
    (acc, episodeFile) => {
      acc[episodeFile.id] = episodeFile;
      return acc;
    },
    {}
  );

  return episodes.filter((episode) => {
    const tierIndex = getEpisodeQualityTierIndex(episode, episodeFileById);
    return tierIndex >= minIndex && tierIndex <= maxIndex;
  });
}
