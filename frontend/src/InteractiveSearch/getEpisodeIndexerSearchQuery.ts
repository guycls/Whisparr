import Episode from 'Episode/Episode';
import Series from 'Series/Series';

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
  ignoreSceneDate: boolean
): string {
  if (!series || !episode) {
    return '';
  }

  const siteTitle = series.studioSearchPrefix || series.title;

  if (ignoreSceneDate) {
    return `${siteTitle} ${episode.title}`.trim();
  }

  const sceneTitle = series.studioSearchPrefix || series.titleSlug;
  const datePart = episode.airDate ? formatReleaseDate(episode.airDate) : '';

  return `${sceneTitle} ${datePart}`.trim();
}
