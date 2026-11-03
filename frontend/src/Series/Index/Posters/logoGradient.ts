const pixelRatio = Math.max(Math.round(window.devicePixelRatio), 1);
const SAMPLE_WIDTH = 32;
const SAMPLE_HEIGHT = 20;
const SATURATION_MIN = 0.18;

const cache = new Map<string, Promise<string | null>>();

type Rgb = [number, number, number];

interface Bucket {
  r: number;
  g: number;
  b: number;
  count: number;
}

export function logoCoverUrl(url: string, size = 250) {
  return url.replace('logo.jpg', `logo-${pixelRatio * size}.jpg`);
}

function saturation(r: number, g: number, b: number) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  if (max === 0) {
    return 0;
  }

  return (max - min) / max;
}

function addSample(buckets: Map<string, Bucket>, r: number, g: number, b: number) {
  const qr = Math.round(r / 24) * 24;
  const qg = Math.round(g / 24) * 24;
  const qb = Math.round(b / 24) * 24;
  const key = `${qr},${qg},${qb}`;
  const bucket = buckets.get(key);

  if (bucket) {
    bucket.r += r;
    bucket.g += g;
    bucket.b += b;
    bucket.count += 1;
    return;
  }

  buckets.set(key, { r, g, b, count: 1 });
}

function topColors(buckets: Map<string, Bucket>, limit: number): Rgb[] {
  return [...buckets.values()]
    .sort((left, right) => right.count - left.count)
    .slice(0, limit)
    .map((bucket) => [
      Math.round(bucket.r / bucket.count),
      Math.round(bucket.g / bucket.count),
      Math.round(bucket.b / bucket.count),
    ]);
}

function rgb([r, g, b]: Rgb) {
  return `rgb(${r}, ${g}, ${b})`;
}

function relativeLuminance(r: number, g: number, b: number) {
  const channel = (value: number) => {
    const scaled = value / 255;

    return scaled <= 0.03928
      ? scaled / 12.92
      : ((scaled + 0.055) / 1.055) ** 2.4;
  };

  return (
    0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
  );
}

function rgbToHsl(r: number, g: number, b: number) {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;

  if (max === min) {
    return [0, 0, lightness];
  }

  const delta = max - min;
  const saturation =
    lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
  let hue = 0;

  if (max === red) {
    hue = (green - blue) / delta + (green < blue ? 6 : 0);
  } else if (max === green) {
    hue = (blue - red) / delta + 2;
  } else {
    hue = (red - green) / delta + 4;
  }

  return [hue / 6, saturation, lightness];
}

function hslToRgb(hue: number, saturation: number, lightness: number): Rgb {
  if (saturation === 0) {
    const value = Math.round(lightness * 255);

    return [value, value, value];
  }

  const hueToRgb = (p: number, q: number, t: number) => {
    let channel = t;

    if (channel < 0) {
      channel += 1;
    }

    if (channel > 1) {
      channel -= 1;
    }

    if (channel < 1 / 6) {
      return p + (q - p) * 6 * channel;
    }

    if (channel < 1 / 2) {
      return q;
    }

    if (channel < 2 / 3) {
      return p + (q - p) * (2 / 3 - channel) * 6;
    }

    return p;
  };

  const q =
    lightness < 0.5
      ? lightness * (1 + saturation)
      : lightness + saturation - lightness * saturation;
  const p = 2 * lightness - q;

  return [
    Math.round(hueToRgb(p, q, hue + 1 / 3) * 255),
    Math.round(hueToRgb(p, q, hue) * 255),
    Math.round(hueToRgb(p, q, hue - 1 / 3) * 255),
  ];
}

function backdropColor(color: Rgb, lightBackdrop: boolean, index: number): Rgb {
  const [hue, saturation] = rgbToHsl(color[0], color[1], color[2]);
  const colorful = saturation >= 0.12;
  const nextSaturation = colorful
    ? Math.min(Math.max(saturation, 0.28), lightBackdrop ? 0.34 : 0.55)
    : 0;
  const lightness = lightBackdrop ? 0.9 - index * 0.05 : 0.12 + index * 0.05;

  return hslToRgb(hue, nextSaturation, lightness);
}

function gradientCss(colors: Rgb[], lightBackdrop: boolean) {
  const stops = colors.map((color, index) =>
    rgb(backdropColor(color, lightBackdrop, index))
  );

  if (stops.length === 1) {
    const alt = rgb(backdropColor(colors[0], lightBackdrop, 1));

    return `linear-gradient(145deg, ${stops[0]} 0%, ${alt} 100%)`;
  }

  if (stops.length === 2) {
    return `linear-gradient(145deg, ${stops[0]} 0%, ${stops[1]} 100%)`;
  }

  return `linear-gradient(145deg, ${stops[0]} 0%, ${stops[1]} 55%, ${stops[2]} 100%)`;
}

function sampleLogo(image: HTMLImageElement) {
  const canvas = document.createElement('canvas');
  canvas.width = SAMPLE_WIDTH;
  canvas.height = SAMPLE_HEIGHT;

  const context = canvas.getContext('2d', { willReadFrequently: true });

  if (!context) {
    return null;
  }

  context.drawImage(image, 0, 0, SAMPLE_WIDTH, SAMPLE_HEIGHT);

  let pixels: Uint8ClampedArray;

  try {
    pixels = context.getImageData(0, 0, SAMPLE_WIDTH, SAMPLE_HEIGHT).data;
  } catch {
    return null;
  }

  const chromatic = new Map<string, Bucket>();
  const neutral = new Map<string, Bucket>();
  let luminanceSum = 0;
  let opaqueCount = 0;

  for (let index = 0; index < pixels.length; index += 4) {
    const r = pixels[index];
    const g = pixels[index + 1];
    const b = pixels[index + 2];
    const alpha = pixels[index + 3];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);

    if (alpha < 40) {
      continue;
    }

    luminanceSum += relativeLuminance(r, g, b);
    opaqueCount += 1;

    const colorful =
      saturation(r, g, b) >= SATURATION_MIN && max >= 22 && min <= 235;

    addSample(colorful ? chromatic : neutral, r, g, b);
  }

  const colors = chromatic.size
    ? topColors(chromatic, 3)
    : topColors(neutral, 3);

  if (!colors.length || !opaqueCount) {
    return null;
  }

  const lightBackdrop = luminanceSum / opaqueCount < 0.18;

  return gradientCss(colors, lightBackdrop);
}

export function loadLogoGradient(url: string) {
  const cached = cache.get(url);

  if (cached) {
    return cached;
  }

  const pending = new Promise<string | null>((resolve) => {
    const image = new Image();

    image.onload = () => {
      try {
        resolve(sampleLogo(image));
      } catch {
        resolve(null);
      }
    };

    image.onerror = () => resolve(null);
    image.src = url;
  });

  cache.set(url, pending);

  return pending;
}
