import Box from '@mui/material/Box';
import { SxProps, Theme } from '@mui/material/styles';
import React from 'react';
import Popover from 'Components/Tooltip/Popover';
import SeasonDetails from 'Series/Index/Select/SeasonPass/SeasonDetails';
import { Season } from 'Series/Series';
import translate from 'Utilities/String/translate';

interface SeasonsCellProps {
  sx?: SxProps<Theme>;
  seriesId: number;
  seasonCount: number;
  seasons: Season[];
  isSelectMode: boolean;
}

function SeasonsCell(props: SeasonsCellProps) {
  const { sx, seriesId, seasonCount, seasons, isSelectMode } = props;

  return (
    <Box
      sx={
        [
          ...(sx == null ? [] : [sx]),
          { '& span': { width: '100%', cursor: 'default' } },
        ] as SxProps<Theme>
      }
    >
      {isSelectMode ? (
        <Popover
          anchor={seasonCount}
          title={translate('SeasonDetails')}
          body={<SeasonDetails seriesId={seriesId} seasons={seasons} />}
          position="left"
        />
      ) : (
        seasonCount
      )}
    </Box>
  );
}

export default SeasonsCell;
