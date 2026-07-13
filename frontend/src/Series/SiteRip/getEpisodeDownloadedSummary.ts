import Episode from 'Episode/Episode';
import { EpisodeFile } from 'EpisodeFile/EpisodeFile';
import { QualityModel } from 'Quality/Quality';
import { QualitySource } from 'Quality/Quality';

const BRACKET_PART_REGEX = /\[\d{1,3}[/+]\d{1,3}\]/gi;
const PART_OF_REGEX = /(?:^|[\s._-])(?:Part|Pt\.?)\s*\d{1,3}(?:\s*of\s*\d{1,3})?(?:[\s._-]|$)/gi;
const CD_REGEX = /(?:^|[\s._-])(?:cd|disc)\d{1,3}(?:[\s._-]|$)/gi;

export interface EpisodeDownloadedSummary {
  totalSize: number;
  quality: QualityModel;
  partCount: number;
}

function getQualityTierIndex(quality: QualityModel): number {
  if (!quality?.quality) {
    return 0;
  }

  const { quality: qualityInfo } = quality;

  if (qualityInfo.source === QualitySource.VR) {
    return 6;
  }

  if (!qualityInfo.resolution) {
    return 0;
  }

  const resolutionTiers: Record<number, number> = {
    480: 1,
    576: 2,
    720: 3,
    1080: 4,
    2160: 5
  };

  return resolutionTiers[qualityInfo.resolution] ?? 0;
}

function getBaseFileName(relativePath: string): string {
  const fileName = relativePath.split(/[/\\]/).pop() || relativePath;
  const withoutExtension = fileName.replace(/\.[^.]+$/, '');

  return withoutExtension
    .replace(BRACKET_PART_REGEX, '')
    .replace(PART_OF_REGEX, '')
    .replace(CD_REGEX, '')
    .trim()
    .toLowerCase();
}

function findRelatedEpisodeFiles(
  primaryFile: EpisodeFile,
  episodeFiles: EpisodeFile[]
): EpisodeFile[] {
  const baseName = getBaseFileName(primaryFile.relativePath);

  return episodeFiles.filter((file) => {
    if (file.seriesId !== primaryFile.seriesId) {
      return false;
    }

    return getBaseFileName(file.relativePath) === baseName;
  });
}

function getBestQuality(files: EpisodeFile[]): QualityModel | undefined {
  let bestFile: EpisodeFile | undefined;
  let bestTier = -1;

  files.forEach((file) => {
    if (!file.quality) {
      return;
    }

    const tier = getQualityTierIndex(file.quality);

    if (tier > bestTier) {
      bestTier = tier;
      bestFile = file;
    }
  });

  return bestFile?.quality;
}

export function getEpisodeDownloadedSummary(
  episode: Episode | undefined,
  episodeFiles: EpisodeFile[]
): EpisodeDownloadedSummary | null {
  if (!episode?.hasFile || !episode.episodeFileId) {
    return null;
  }

  const primaryFile = episodeFiles.find((file) => file.id === episode.episodeFileId);

  if (!primaryFile) {
    return null;
  }

  const relatedFiles = findRelatedEpisodeFiles(primaryFile, episodeFiles);
  const quality = getBestQuality(relatedFiles);

  if (!quality) {
    return null;
  }

  return {
    totalSize: relatedFiles.reduce((total, file) => total + file.size, 0),
    quality,
    partCount: relatedFiles.length
  };
}
