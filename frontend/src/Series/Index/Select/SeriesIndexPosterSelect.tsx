import Box from '@mui/material/Box';
import React, { SyntheticEvent, useCallback } from 'react';
import { useSelect } from 'App/SelectContext';
import Icon from 'Components/Icon';
import Link from 'Components/Link/Link';
import { icons } from 'Helpers/Props';

interface SeriesIndexPosterSelectProps {
  seriesId: number;
}

function SeriesIndexPosterSelect(props: SeriesIndexPosterSelectProps) {
  const { seriesId } = props;
  const [selectState, selectDispatch] = useSelect();
  const isSelected = selectState.selectedState[seriesId];

  const onSelectPress = useCallback(
    (event: SyntheticEvent) => {
      const nativeEvent = event.nativeEvent as PointerEvent;
      const shiftKey = nativeEvent.shiftKey;

      selectDispatch({
        type: 'toggleSelected',
        id: seriesId,
        isSelected: !isSelected,
        shiftKey,
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
        width: 36,
        height: 36,
        '& .MuiButton-root': {
          width: 36,
          height: 36,
          minWidth: 36,
          p: 0,
        },
        '& .poster-select-selected': { color: 'primary.main' },
        '& .poster-select-unselected': { color: 'common.white' },
        '&:hover .poster-select-selected': { color: 'common.white' },
        '&:hover .poster-select-unselected': { color: 'primary.main' },
      }}
    >
      <Link onPress={onSelectPress}>
        <Box
          className={
            isSelected ? 'poster-select-selected' : 'poster-select-unselected'
          }
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            display: 'flex',
            width: 20,
            height: 20,
            borderRadius: '50%',
            bgcolor: 'text.secondary',
          }}
        >
          <Icon
            name={isSelected ? icons.CHECK_CIRCLE : icons.CIRCLE_OUTLINE}
            size={20}
          />
        </Box>
      </Link>
    </Box>
  );
}

export default SeriesIndexPosterSelect;
