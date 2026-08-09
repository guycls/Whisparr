const VIDEO_EXTENSIONS = [
  'webm',
  'm4v',
  '3gp',
  'nsv',
  'ty',
  'strm',
  'rm',
  'rmvb',
  'm3u',
  'ifo',
  'mov',
  'qt',
  'divx',
  'xvid',
  'bivx',
  'nrg',
  'pva',
  'wmv',
  'asf',
  'asx',
  'ogm',
  'ogv',
  'm2v',
  'avi',
  'bin',
  'dat',
  'dvr-ms',
  'mpg',
  'mpeg',
  'mp4',
  'avc',
  'vp3',
  'svq3',
  'nuv',
  'viv',
  'dv',
  'fli',
  'flv',
  'wpl',
  'f4v',
  'img',
  'iso',
  'vob',
  'mkv',
  'ts',
  'wtv',
  'm2ts'
];

const TRAILING_QUALITY_REGEX = /(?:[\s\-:]+)?(?:4k|2160p|1080p|720p|480p|360p|540p|576p|1440p|fhd|hd|uhd|sd)$/i;

const TRAILING_EXTENSION_REGEX = new RegExp(
  `\\.?(?:${VIDEO_EXTENSIONS.join('|')})$`,
  'i'
);

function removeTrailingExtension(title: string): string {
  const match = title.match(TRAILING_EXTENSION_REGEX);

  if (!match) {
    return title;
  }

  return title.slice(0, title.length - match[0].length).trimEnd();
}

function removeTrailingQuality(title: string): string {
  const match = title.match(TRAILING_QUALITY_REGEX);

  if (!match) {
    return title;
  }

  return title.slice(0, title.length - match[0].length).trimEnd();
}

export default function cleanSceneTitleForSearch(title: string): string {
  if (!title?.trim()) {
    return title ?? '';
  }

  let result = title.trim();
  let changed = true;

  while (changed) {
    changed = false;

    const withoutExtension = removeTrailingExtension(result);

    if (withoutExtension !== result) {
      result = withoutExtension;
      changed = true;
    }

    const withoutQuality = removeTrailingQuality(result);

    if (withoutQuality !== result) {
      result = withoutQuality;
      changed = true;
    }
  }

  return result.replace(/[\-:\s]+$/, '').trim();
}
