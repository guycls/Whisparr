import React from 'react';
import EpisodeSceneDetails from 'Episode/EpisodeSceneDetails';
import styles from './SiteRipMatchingView.css';

interface SiteRipSceneDetailsProps {
  seriesId: number;
  episodeId?: number;
}

function SiteRipSceneDetails(props: SiteRipSceneDetailsProps) {
  const { seriesId, episodeId } = props;

  return (
    <EpisodeSceneDetails
      seriesId={seriesId}
      episodeId={episodeId}
      episodeEntity="episodes"
      className={styles.sceneDetails}
      scrollerClassName={styles.sceneDetailsScroller}
    />
  );
}

export default SiteRipSceneDetails;
