export const SITES_CARD_SIZE_MIN = 120;
export const SITES_CARD_SIZE_MAX = 320;
export const SITES_CARD_SIZE_STEP = 10;

export const CARD_SIZE_PRESETS = {
  small: 120,
  medium: 170,
  large: 220,
} as const;

export type PosterSizeName = keyof typeof CARD_SIZE_PRESETS;

export function cardSizeFromPosterSize(size?: string | null) {
  if (size === 'small' || size === 'medium' || size === 'large') {
    return CARD_SIZE_PRESETS[size];
  }

  return CARD_SIZE_PRESETS.large;
}

export function clampSitesCardSize(value: number) {
  return Math.min(
    SITES_CARD_SIZE_MAX,
    Math.max(SITES_CARD_SIZE_MIN, Math.round(value))
  );
}

export function resolveSitesCardSize(
  cardSize: number | null | undefined,
  posterSize?: string | null
) {
  if (typeof cardSize === 'number' && Number.isFinite(cardSize)) {
    return clampSitesCardSize(cardSize);
  }

  return cardSizeFromPosterSize(posterSize);
}

export function posterSizeFromCardSize(cardSize: number): PosterSizeName {
  const sizes = Object.keys(CARD_SIZE_PRESETS) as PosterSizeName[];

  return sizes.reduce((closest, size) => {
    const closestDistance = Math.abs(CARD_SIZE_PRESETS[closest] - cardSize);
    const distance = Math.abs(CARD_SIZE_PRESETS[size] - cardSize);

    return distance < closestDistance ? size : closest;
  });
}
