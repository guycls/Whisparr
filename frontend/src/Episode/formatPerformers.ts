import Episode from 'Episode/Episode';

export default function formatPerformers(actors: Episode['actors']) {
  return actors
    .map((actor) => actor.character || actor.name)
    .filter(Boolean)
    .join(', ');
}
