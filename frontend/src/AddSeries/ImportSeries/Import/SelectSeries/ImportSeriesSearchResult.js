import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import Icon from 'Components/Icon';
import Link from 'Components/Link/Link';
import { icons } from 'Helpers/Props';
import ImportSeriesTitle from './ImportSeriesTitle';

function ImportSeriesSearchResult(props) {
  const {
    tvdbId,
    title,
    year,
    network,
    isExistingSeries,
    onPress
  } = props;

  const onPressCallback = useCallback(() => onPress(tvdbId), [tvdbId, onPress]);

  return (
    <Box
      sx={{
        display: 'flex',
        py: '10px',
        px: '20px',
        width: '100%',
        '&:hover': {
          backgroundColor: 'var(--menuItemHoverBackgroundColor)'
        }
      }}
    >
      <Link
        sx={{ flex: '1 0 0', overflow: 'hidden' }}
        onPress={onPressCallback}
      >
        <ImportSeriesTitle
          title={title}
          year={year}
          network={network}
          isExistingSeries={isExistingSeries}
        />
      </Link>

      <Link
        sx={{ ml: 'auto', color: 'var(--textColor)' }}
        to={`https://theporndb.net/sites/${tvdbId}`}
      >
        <Box component="span" sx={{ ml: '10px', display: 'inline-flex' }}>
          <Icon
            name={icons.EXTERNAL_LINK}
            size={16}
          />
        </Box>
      </Link>
    </Box>
  );
}

ImportSeriesSearchResult.propTypes = {
  tvdbId: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  year: PropTypes.number.isRequired,
  network: PropTypes.string,
  isExistingSeries: PropTypes.bool.isRequired,
  onPress: PropTypes.func.isRequired
};

export default ImportSeriesSearchResult;
