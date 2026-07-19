import React from 'react';
import { EpisodeEntities } from 'Episode/useEpisode';
import EpisodeCardConnector from './EpisodeCardConnector';
import styles from './SeriesDetailsEpisodeGrid.css';

interface EpisodeItem {
  id: number;
}

interface SeriesDetailsEpisodeGridProps {
  items: EpisodeItem[];
  isSmallScreen: boolean;
  episodeEntity?: EpisodeEntities;
  onMonitorEpisodePress(
    id: number,
    monitored: boolean,
    options: { shiftKey: boolean }
  ): void;
}

function SeriesDetailsEpisodeGrid(props: SeriesDetailsEpisodeGridProps) {
  const {
    items,
    isSmallScreen,
    episodeEntity = 'episodes',
    onMonitorEpisodePress,
  } = props;

  return (
    <div className={styles.grid}>
      {items.map((item) => {
        return (
          <EpisodeCardConnector
            key={item.id}
            {...item}
            isSmallScreen={isSmallScreen}
            episodeEntity={episodeEntity}
            onMonitorEpisodePress={onMonitorEpisodePress}
          />
        );
      })}
    </div>
  );
}

export default SeriesDetailsEpisodeGrid;
