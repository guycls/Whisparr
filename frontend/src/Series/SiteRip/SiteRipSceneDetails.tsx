import React from 'react';
import EpisodeSceneDetails from 'Episode/EpisodeSceneDetails';
import { useSiteRipEpisode } from './useSiteRipSeriesEpisodes';

interface SiteRipSceneDetailsProps {
  seriesId: number;
  episodeId?: number;
}

function SiteRipSceneDetails(props: SiteRipSceneDetailsProps) {
  const { seriesId, episodeId } = props;
  const episode = useSiteRipEpisode(seriesId, episodeId);

  return (
    <EpisodeSceneDetails
      seriesId={seriesId}
      episodeId={episodeId}
      episode={episode}
      className="site-rip-scene-details-root"
      scrollerClassName="site-rip-scene-details-scroller"
    />
  );
}

export default SiteRipSceneDetails;
