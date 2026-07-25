export interface SiteRipMatch {
  fileIndices: number[];
  filePaths: string[];
  totalSize: number;
  partNumber?: number;
  partTotal?: number;
  matchedEpisodeId?: number;
  matchConfidence: string;
  selectedByDefault: boolean;
  displayName: string;
}

export interface SiteRipSelection {
  selected: boolean;
  episodeId?: number;
}

export interface SiteRipRelease {
  guid: string;
  indexerId: number;
  title: string;
  indexer: string;
  size: number;
  age: number;
  ageHours: number;
  ageMinutes: number;
  seeders?: number;
  leechers?: number;
  rejections: string[];
  releaseWeight?: number;
  infoUrl?: string;
}

export default interface SiteRipAppState {
  isFetching: boolean;
  isPopulated: boolean;
  error: object | null;
  items: SiteRipRelease[];
  searchStatusMessage: string | null;
  searchId: string | null;
  sortKey: string;
  sortDirection: string;
  sortPredicates?: Record<string, (item: SiteRipRelease) => number | string>;
  view: 'search' | 'matching';
  selectedRelease: SiteRipRelease | null;
  torrentFiles: object[];
  isFilesFetching: boolean;
  filesError: object | null;
  matches: SiteRipMatch[];
  isMatching: boolean;
  matchError: object | null;
  matchId: string | null;
  matchStatusMessage: string | null;
  matchPhase: string | null;
  matchCompletedFiles: number;
  matchTotalFiles: number;
  selections: Record<number, SiteRipSelection>;
  isGrabbing: boolean;
  isGrabbed: boolean;
  grabError: string | null;
}
