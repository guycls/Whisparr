import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React from 'react';
import formatBytes from 'Utilities/Number/formatBytes';
import translate from 'Utilities/String/translate';
import EnhancedSelectInputSelectedValue from './EnhancedSelectInputSelectedValue';

function RootFolderSelectInputSelectedValue(props) {
  const {
    value,
    freeSpace,
    seriesFolder,
    includeFreeSpace,
    isWindows,
    ...otherProps
  } = props;

  const slashCharacter = isWindows ? '\\' : '/';

  return (
    <EnhancedSelectInputSelectedValue
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        overflow: 'hidden'
      }}
      {...otherProps}
    >
      <Box
        sx={{
          display: 'flex',
          flex: '1 0 0',
          overflow: 'hidden',
          maxWidth: '100%',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}
      >
        <Box sx={{ flex: '0 1 auto' }}>
          {value}
        </Box>

        {
          seriesFolder ?
            <Box
              sx={{
                flex: '0 1 auto',
                color: 'var(--disabledColor)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {slashCharacter}
              {seriesFolder}
            </Box> :
            null
        }
      </Box>

      {
        freeSpace != null && includeFreeSpace &&
          <Box
            sx={{
              flex: '0 0 auto',
              ml: '15px',
              color: 'var(--gray)',
              textAlign: 'right',
              fontSize: 12
            }}
          >
            {translate('RootFolderSelectFreeSpace', { freeSpace: formatBytes(freeSpace) })}
          </Box>
      }
    </EnhancedSelectInputSelectedValue>
  );
}

RootFolderSelectInputSelectedValue.propTypes = {
  value: PropTypes.string,
  freeSpace: PropTypes.number,
  seriesFolder: PropTypes.string,
  isWindows: PropTypes.bool,
  includeFreeSpace: PropTypes.bool.isRequired
};

RootFolderSelectInputSelectedValue.defaultProps = {
  includeFreeSpace: true
};

export default RootFolderSelectInputSelectedValue;
