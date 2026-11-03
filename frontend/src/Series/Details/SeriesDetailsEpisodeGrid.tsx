import Box from '@mui/material/Box';
import React from 'react';
import { EpisodeEntities } from 'Episode/useEpisode';
import EpisodeCardConnector from './EpisodeCardConnector';

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

const gridColumns = {
  xs: 'repeat(auto-fill, minmax(max(140px, calc((100% - 4 * 10px) / 5)), 1fr))',
  md: 'repeat(auto-fill, minmax(max(200px, calc((100% - 4 * 15px) / 5)), 1fr))',
  xl: 'repeat(auto-fill, minmax(max(180px, calc((100% - 4 * 15px) / 5)), 1fr))',
};

function SeriesDetailsEpisodeGrid(props: SeriesDetailsEpisodeGridProps) {
  const {
    items,
    isSmallScreen,
    episodeEntity = 'episodes',
    onMonitorEpisodePress,
  } = props;

  return (
    <Box
      sx={{
        display: 'grid',
        alignItems: 'stretch',
        gridTemplateColumns: gridColumns,
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
            episodeEntity={episodeEntity}
            onMonitorEpisodePress={onMonitorEpisodePress}
          />
        );
      })}
    </Box>
  );
}

export default SeriesDetailsEpisodeGrid;
