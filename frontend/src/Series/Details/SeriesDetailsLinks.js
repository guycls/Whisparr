import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React from 'react';
import Label from 'Components/Label';
import Link from 'Components/Link/Link';
import { kinds, sizes } from 'Helpers/Props';

function SeriesDetailsLinks(props) {
  const {
    tvdbId
  } = props;

  return (
    <Box
      sx={{
        m: 0,
        display: { xs: 'flex', sm: 'block' },
        flexFlow: { xs: 'column wrap', sm: 'unset' }
      }}
    >
      <Link
        sx={{ whiteSpace: 'nowrap' }}
        to={`https://theporndb.net/sites/${tvdbId}`}
      >
        <Label
          kind={kinds.INFO}
          size={sizes.LARGE}
        >
          <Box component="span" sx={{ cursor: 'pointer' }}>
            TPDB
          </Box>
        </Label>
      </Link>
    </Box>
  );
}

SeriesDetailsLinks.propTypes = {
  tvdbId: PropTypes.number.isRequired
};

export default SeriesDetailsLinks;
