import React from 'react';
import EpisodeCardConnector from './EpisodeCardConnector';
import styles from './SeriesDetailsEpisodeGrid.css';

interface EpisodeItem {
  id: number;
}

interface SeriesDetailsEpisodeGridProps {
  items: EpisodeItem[];
  isSmallScreen: boolean;
  onMonitorEpisodePress(
    id: number,
    monitored: boolean,
    options: { shiftKey: boolean }
  ): void;
}

function SeriesDetailsEpisodeGrid(props: SeriesDetailsEpisodeGridProps) {
  const { items, isSmallScreen, onMonitorEpisodePress } = props;

  return (
    <div className={styles.grid}>
      {items.map((item) => {
        return (
          <EpisodeCardConnector
            key={item.id}
            {...item}
            isSmallScreen={isSmallScreen}
            onMonitorEpisodePress={onMonitorEpisodePress}
          />
        );
      })}
    </div>
  );
}

export default SeriesDetailsEpisodeGrid;
