import Box from '@mui/material/Box';
import React from 'react';
import Icon, { IconProps } from 'Components/Icon';
import Tooltip from 'Components/Tooltip/Tooltip';
import { icons, kinds, tooltipPositions } from 'Helpers/Props';
import translate from 'Utilities/String/translate';

interface HeartRatingProps {
  rating: number;
  votes?: number;
  iconSize?: IconProps['size'];
}

function HeartRating({ rating, votes = 0, iconSize = 14 }: HeartRatingProps) {
  return (
    <Tooltip
      anchor={
        <Box
          component="span"
          sx={{ display: 'inline-flex', alignItems: 'center' }}
        >
          <Box
            component="span"
            sx={{
              mr: '4px',
              color: 'var(--dangerColor)',
              display: 'inline-flex',
            }}
          >
            <Icon name={icons.HEART} size={iconSize} />
          </Box>
          {rating * 10}%
        </Box>
      }
      tooltip={translate('CountVotes', { votes })}
      kind={kinds.INVERSE}
      position={tooltipPositions.TOP}
    />
  );
}

export default HeartRating;
