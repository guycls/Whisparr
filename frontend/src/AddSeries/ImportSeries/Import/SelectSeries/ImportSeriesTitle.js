import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React from 'react';
import Label from 'Components/Label';
import { kinds } from 'Helpers/Props';
import translate from 'Utilities/String/translate';

function ImportSeriesTitle(props) {
  const {
    title,
    year,
    network,
    isExistingSeries
  } = props;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        flex: '0 1 auto',
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          overflow: 'hidden',
          maxWidth: '100%',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
      >
        {title}
      </Box>

      {
        !title.contains(year) &&
        year > 0 ?
          <Box component="span" sx={{ mx: '5px', color: 'var(--disabledColor)' }}>
            ({year})
          </Box> :
          null
      }

      {
        network ?
          <Label>{network}</Label> :
          null
      }

      {
        isExistingSeries ?
          <Label
            kind={kinds.WARNING}
          >
            {translate('Existing')}
          </Label> :
          null
      }
    </Box>
  );
}

ImportSeriesTitle.propTypes = {
  title: PropTypes.string.isRequired,
  year: PropTypes.number.isRequired,
  network: PropTypes.string,
  isExistingSeries: PropTypes.bool.isRequired
};

export default ImportSeriesTitle;
