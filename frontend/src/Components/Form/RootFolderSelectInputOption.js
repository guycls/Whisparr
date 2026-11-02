import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React from 'react';
import formatBytes from 'Utilities/Number/formatBytes';
import translate from 'Utilities/String/translate';
import EnhancedSelectInputOption from './EnhancedSelectInputOption';

function RootFolderSelectInputOption(props) {
  const {
    id,
    value,
    freeSpace,
    isMissing,
    seriesFolder,
    isMobile,
    isWindows,
    ...otherProps
  } = props;

  const slashCharacter = isWindows ? '\\' : '/';

  return (
    <EnhancedSelectInputOption
      id={id}
      isMobile={isMobile}
      {...otherProps}
    >
      <Box
        sx={{
          display: isMobile ? 'block' : 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flex: '1 0 0'
        }}
      >
        <Box sx={{ display: 'flex' }}>
          {value}

          {
            seriesFolder && id !== 'addNew' ?
              <Box sx={{ flex: '0 0 auto', color: 'var(--disabledColor)' }}>
                {slashCharacter}
                {seriesFolder}
              </Box> :
              null
          }
        </Box>

        {
          freeSpace == null ?
            null :
            <Box
              sx={{
                ml: isMobile ? 0 : '15px',
                color: 'var(--darkGray)',
                fontSize: 12
              }}
            >
              {translate('RootFolderSelectFreeSpace', { freeSpace: formatBytes(freeSpace) })}
            </Box>
        }

        {
          isMissing ?
            <Box
              sx={{
                ml: '15px',
                color: 'var(--dangerColor)',
                fontSize: 12
              }}
            >
              {translate('Missing')}
            </Box> :
            null
        }
      </Box>
    </EnhancedSelectInputOption>
  );
}

RootFolderSelectInputOption.propTypes = {
  id: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  freeSpace: PropTypes.number,
  isMissing: PropTypes.bool,
  seriesFolder: PropTypes.string,
  isMobile: PropTypes.bool.isRequired,
  isWindows: PropTypes.bool
};

export default RootFolderSelectInputOption;
