import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React from 'react';
import Label from 'Components/Label';
import Tooltip from 'Components/Tooltip/Tooltip';
import { kinds, sizes, tooltipPositions } from 'Helpers/Props';

function SeriesGenres({ genres }) {
  const [firstGenre, ...otherGenres] = genres;

  if (otherGenres.length) {
    return (
      <Tooltip
        anchor={
          <Box component="span" sx={{ mr: '15px' }}>
            {firstGenre}
          </Box>
        }
        tooltip={
          <div>
            {
              otherGenres.map((tag) => {
                return (
                  <Label
                    key={tag}
                    kind={kinds.INFO}
                    size={sizes.LARGE}
                  >
                    {tag}
                  </Label>
                );
              })
            }
          </div>
        }
        kind={kinds.INVERSE}
        position={tooltipPositions.TOP}
      />
    );
  }

  return (
    <Box component="span" sx={{ mr: '15px' }}>
      {firstGenre}
    </Box>
  );
}

SeriesGenres.propTypes = {
  genres: PropTypes.arrayOf(PropTypes.string).isRequired
};

export default SeriesGenres;
