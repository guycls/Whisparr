import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import React, { useCallback } from 'react';
import { useSelect } from 'App/SelectContext';

interface SeriesDetailsEpisodeSelectProps {
  episodeId: number;
}

function SeriesDetailsEpisodeSelect(props: SeriesDetailsEpisodeSelectProps) {
  const { episodeId } = props;
  const [selectState, selectDispatch] = useSelect();
  const isSelected = selectState.selectedState[episodeId];

  const onSelectPress = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();

      selectDispatch({
        type: 'toggleSelected',
        id: episodeId,
        isSelected: !isSelected,
        shiftKey: event.shiftKey,
      });
    },
    [episodeId, isSelected, selectDispatch]
  );

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 3,
      }}
    >
      <Checkbox
        checked={!!isSelected}
        onClick={onSelectPress}
        sx={{
          m: '4px',
          color: 'common.white',
          bgcolor: 'rgba(0, 0, 0, 0.55)',
          borderRadius: '4px',
          '&.Mui-checked': {
            color: 'primary.main',
          },
        }}
      />
    </Box>
  );
}

export default SeriesDetailsEpisodeSelect;
