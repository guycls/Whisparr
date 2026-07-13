import { SiteRipSelection } from 'App/State/SiteRipAppState';

export type SiteRipFileRowState =
  | 'matchedSelected'
  | 'matchedUnselected'
  | 'unmatched';

export function getSiteRipFileRowState(
  selection?: SiteRipSelection
): SiteRipFileRowState {
  if (!selection?.episodeId) {
    return 'unmatched';
  }

  if (selection.selected) {
    return 'matchedSelected';
  }

  return 'matchedUnselected';
}
