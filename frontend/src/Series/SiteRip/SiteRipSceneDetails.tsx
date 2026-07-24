import React from 'react';
import EpisodeSceneDetails from 'Episode/EpisodeSceneDetails';
import { useSiteRipEpisode } from './useSiteRipSeriesEpisodes';
import styles from './SiteRipMatchingView.css';

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
      className={styles.sceneDetails}
      scrollerClassName={styles.sceneDetailsScroller}
    />
  );
}

export default SiteRipSceneDetails;
