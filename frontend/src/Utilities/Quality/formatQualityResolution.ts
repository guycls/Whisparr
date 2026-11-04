import { QualityModel } from 'Quality/Quality';

function labelFromEdges(longEdge: number, shortEdge: number) {
  if (longEdge <= 0 || shortEdge <= 0) {
    return null;
  }

  if (shortEdge >= 4000 || longEdge >= 7000) {
    return '8K';
  }

  if (shortEdge >= 2500 || longEdge >= 4800) {
    return '5K';
  }

  if (shortEdge >= 1600 || longEdge >= 3200) {
    return '4K';
  }

  if (shortEdge >= 1200) {
    return '1440p';
  }

  if (shortEdge >= 900 || longEdge >= 1800) {
    return '1080p';
  }

  if (shortEdge >= 650 || longEdge >= 1200) {
    return '720p';
  }

  if (shortEdge >= 530 || longEdge >= 1000) {
    return '576p';
  }

  return '480p';
}

function labelFromResolution(resolution?: number) {
  if (!resolution || resolution <= 0) {
    return null;
  }

  return labelFromEdges(resolution, resolution);
}

function labelFromMediaInfo(resolution?: string) {
  const match = resolution?.match(/(\d+)\s*x\s*(\d+)/i);

  if (!match) {
    return null;
  }

  const width = Number(match[1]);
  const height = Number(match[2]);
  const longEdge = Math.max(width, height);
  const shortEdge = Math.min(width, height);

  return labelFromEdges(longEdge, shortEdge);
}

export default function formatQualityResolution(
  quality: QualityModel,
  mediaInfoResolution?: string
) {
  return (
    labelFromMediaInfo(mediaInfoResolution) ??
    labelFromResolution(quality?.quality?.resolution) ??
    quality?.quality?.name ??
    ''
  );
}
