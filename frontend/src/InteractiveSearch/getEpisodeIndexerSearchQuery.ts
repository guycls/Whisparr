import Episode from 'Episode/Episode';
import Series from 'Series/Series';
import cleanSceneTitleForSearch from './cleanSceneTitleForSearch';

function formatReleaseDate(airDate: string): string {
  const [year, month, day] = airDate.split('-');

  if (!year || !month || !day) {
    return '';
  }

  return `${year.slice(2)}.${month}.${day}`;
}

export default function getEpisodeIndexerSearchQuery(
  series: Series | undefined,
  episode: Episode | undefined,
  ignoreSceneDate: boolean,
  cleanFileFormatWhileSearchingScene = false
): string {
  if (!series || !episode) {
    return '';
  }

  const siteTitle = series.studioSearchPrefix || series.title;

  if (ignoreSceneDate) {
    const sceneTitle = cleanFileFormatWhileSearchingScene ?
      cleanSceneTitleForSearch(episode.title) :
      episode.title;

    return `${siteTitle} ${sceneTitle}`.trim();
  }

  const sceneTitle = series.studioSearchPrefix || series.titleSlug;
  const sceneDate = episode.releaseDate || episode.airDate;
  const datePart = sceneDate ? formatReleaseDate(sceneDate) : '';

  return `${sceneTitle} ${datePart}`.trim();
}
