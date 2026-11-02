import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React from 'react';
import Icon from 'Components/Icon';
import Button from 'Components/Link/Button';
import { icons, kinds, sizes } from 'Helpers/Props';
import translate from 'Utilities/String/translate';

function EpisodeSearch(props) {
  const {
    onQuickSearchPress,
    onInteractiveSearchPress
  } = props;

  return (
    <div>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: '10px' }}>
        <Box sx={{ width: 300, '& .MuiButton-root': { width: '100%' } }}>
          <Button
            size={sizes.LARGE}
            onPress={onQuickSearchPress}
          >
            <Box component="span" sx={{ mr: '5px' }}>
              <Icon
                name={icons.QUICK}
              />
            </Box>

          {translate('QuickSearch')}
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: '10px' }}>
        <Box sx={{ width: 300, '& .MuiButton-root': { width: '100%' } }}>
          <Button
            kind={kinds.PRIMARY}
            size={sizes.LARGE}
            onPress={onInteractiveSearchPress}
          >
            <Box component="span" sx={{ mr: '5px' }}>
              <Icon
                name={icons.INTERACTIVE}
              />
            </Box>

          {translate('InteractiveSearch')}
          </Button>
        </Box>
      </Box>
    </div>
  );
}

EpisodeSearch.propTypes = {
  onQuickSearchPress: PropTypes.func.isRequired,
  onInteractiveSearchPress: PropTypes.func.isRequired
};

export default EpisodeSearch;
