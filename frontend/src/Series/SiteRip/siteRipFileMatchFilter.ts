import { SiteRipSelection } from 'App/State/SiteRipAppState';
import Episode from 'Episode/Episode';
import { EpisodeFile } from 'EpisodeFile/EpisodeFile';
import { getEpisodeDownloadedSummary } from './getEpisodeDownloadedSummary';
import { SiteRipFileListItem } from './SiteRipMatchingFileList';

export type SiteRipFileMatchFilter = '' | 'matched' | 'unmatched' | 'monitored' | 'missing' | 'toGrab';

export function matchesSiteRipFileFilter(
  item: SiteRipFileListItem,
  filter: SiteRipFileMatchFilter,
  selections: Record<number, SiteRipSelection>,
  episodeMap: Record<number, Episode>,
  episodeFiles: EpisodeFile[]
): boolean {
  if (!filter) {
    return true;
  }

  const selection = selections[item.index];
  const episodeId = selection?.episodeId;
  const episode = episodeId ? episodeMap[episodeId] : undefined;
  const isMatched = episodeId != null;

  switch (filter) {
    case 'matched':
      return isMatched;
    case 'unmatched':
      return !isMatched;
    case 'monitored':
      return isMatched && episode?.monitored === true;
    case 'missing':
      return isMatched &&
        episode?.monitored === true &&
        getEpisodeDownloadedSummary(episode, episodeFiles) == null;
    case 'toGrab':
      return selection?.selected === true;
    default:
      return true;
  }
}
