import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import React from 'react';

function SeriesAlternateTitles({ alternateTitles }) {
  return (
    <Box component="ul">
      {
        alternateTitles.map((alternateTitle) => {
          return (
            <Box
              component="li"
              key={alternateTitle.title}
              sx={{ whiteSpace: 'nowrap' }}
            >
              {alternateTitle.title}
              {
                alternateTitle.comment &&
                  <Typography
                    component="span"
                    sx={{ color: 'text.secondary', fontSize: 12 }}
                  >
                    {' '}
                    {alternateTitle.comment}
                  </Typography>
              }
            </Box>
          );
        })
      }
    </Box>
  );
}

SeriesAlternateTitles.propTypes = {
  alternateTitles: PropTypes.arrayOf(PropTypes.object).isRequired
};

export default SeriesAlternateTitles;
