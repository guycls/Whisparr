import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import React, { useCallback } from 'react';
import { useSelect } from 'App/SelectContext';

interface SeriesIndexPosterSelectProps {
  seriesId: number;
}

function SeriesIndexPosterSelect(props: SeriesIndexPosterSelectProps) {
  const { seriesId } = props;
  const [selectState, selectDispatch] = useSelect();
  const isSelected = selectState.selectedState[seriesId];

  const onSelectPress = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();

      selectDispatch({
        type: 'toggleSelected',
        id: seriesId,
        isSelected: !isSelected,
        shiftKey: event.shiftKey,
      });
    },
    [seriesId, isSelected, selectDispatch]
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
          color: 'common.white',
          '&.Mui-checked': {
            color: 'primary.main',
          },
        }}
      />
    </Box>
  );
}

export default SeriesIndexPosterSelect;
