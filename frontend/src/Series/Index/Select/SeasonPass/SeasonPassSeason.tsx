import Box from '@mui/material/Box';
import React, { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import MonitorToggleButton from 'Components/MonitorToggleButton';
import formatSeason from 'Season/formatSeason';
import { Statistics } from 'Series/Series';
import { toggleSeasonMonitored } from 'Store/Actions/seriesActions';
import translate from 'Utilities/String/translate';

interface SeasonPassSeasonProps {
  seriesId: number;
  seasonNumber: number;
  monitored: boolean;
  statistics?: Statistics;
  isSaving: boolean;
}

function SeasonPassSeason(props: SeasonPassSeasonProps) {
  const {
    seriesId,
    seasonNumber,
    monitored,
    statistics = {
      episodeFileCount: 0,
      totalEpisodeCount: 0,
      percentOfEpisodes: 0,
    },
    isSaving = false,
  } = props;

  const { episodeFileCount, totalEpisodeCount, percentOfEpisodes } = statistics;

  const dispatch = useDispatch();
  const onSeasonMonitoredPress = useCallback(() => {
    dispatch(
      toggleSeasonMonitored({ seriesId, seasonNumber, monitored: !monitored })
    );
  }, [seriesId, seasonNumber, monitored, dispatch]);

  const allEpisodes = percentOfEpisodes === 100;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'stretch',
        overflow: 'hidden',
        m: '2px 4px',
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        bgcolor: 'background.paper',
        cursor: 'default',
      }}
    >
      <Box sx={{ px: '4px' }}>
        <MonitorToggleButton
          monitored={monitored}
          isSaving={isSaving}
          onPress={onSeasonMonitoredPress}
        />

        <span>{formatSeason(seasonNumber, true)}</span>
      </Box>

      <Box
        title={translate('SeasonPassEpisodesDownloaded', {
          episodeFileCount,
          totalEpisodeCount,
        })}
        sx={{
          px: '4px',
          bgcolor: allEpisodes ? '#e0ffe0' : 'action.hover',
          color: allEpisodes ? 'text.secondary' : 'text.primary',
        }}
      >
        {totalEpisodeCount === 0
          ? '0/0'
          : `${episodeFileCount}/${totalEpisodeCount}`}
      </Box>
    </Box>
  );
}

export default SeasonPassSeason;
