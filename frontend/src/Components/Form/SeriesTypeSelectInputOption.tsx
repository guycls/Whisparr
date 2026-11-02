import Box from '@mui/material/Box';
import React from 'react';
import EnhancedSelectInputOption from './EnhancedSelectInputOption';

interface SeriesTypeSelectInputOptionProps {
  key: string;
  value: string;
  format: string;
  isMobile: boolean;
}

function SeriesTypeSelectInputOption(props: SeriesTypeSelectInputOptionProps) {
  const { key, value, format, isMobile, ...otherProps } = props;

  return (
    <EnhancedSelectInputOption id={key} isMobile={isMobile} {...otherProps}>
      <Box
        sx={{
          display: isMobile ? 'block' : 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flex: '1 0 0',
        }}
      >
        <Box sx={{ display: 'flex' }}>{value}</Box>

        {format == null ? null : (
          <Box
            sx={{
              ml: isMobile ? 0 : '15px',
              color: 'var(--darkGray)',
              fontSize: 12,
            }}
          >
            {format}
          </Box>
        )}
      </Box>
    </EnhancedSelectInputOption>
  );
}

export default SeriesTypeSelectInputOption;
