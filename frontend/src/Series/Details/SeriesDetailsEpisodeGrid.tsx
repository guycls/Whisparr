import Box from '@mui/material/Box';
import React from 'react';
import { useSelector } from 'react-redux';
import AppState from 'App/State/AppState';
import { EpisodeEntities } from 'Episode/useEpisode';
import EpisodeCardConnector from './EpisodeCardConnector';

interface EpisodeItem {
  id: number;
}

interface SeriesDetailsEpisodeGridProps {
  items: EpisodeItem[];
  isSmallScreen: boolean;
  isSelectMode?: boolean;
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
    isSelectMode = false,
    episodeEntity = 'episodes',
    onMonitorEpisodePress,
  } = props;

  const cardSize = useSelector(
    (state: AppState) => state.seriesDetails.cardSize || 200
  );

  return (
    <Box
      sx={{
        display: 'grid',
        alignItems: 'stretch',
        gridTemplateColumns: `repeat(auto-fill, minmax(${cardSize}px, 1fr))`,
        gap: { xs: '10px', md: '15px' },
        padding: { xs: '0 10px 10px', md: '0 15px 15px' },
      }}
    >
      {items.map((item) => {
        return (
          <EpisodeCardConnector
            key={item.id}
            {...item}
            isSmallScreen={isSmallScreen}
            isSelectMode={isSelectMode}
            episodeEntity={episodeEntity}
            onMonitorEpisodePress={onMonitorEpisodePress}
          />
        );
      })}
    </Box>
  );
}

export default SeriesDetailsEpisodeGrid;
