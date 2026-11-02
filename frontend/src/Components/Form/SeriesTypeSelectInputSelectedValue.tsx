import Box from '@mui/material/Box';
import React from 'react';
import EnhancedSelectInputSelectedValue from './EnhancedSelectInputSelectedValue';

interface SeriesTypeSelectInputOptionProps {
  key: string;
  value: string;
  format: string;
}

function SeriesTypeSelectInputSelectedValue(
  props: SeriesTypeSelectInputOptionProps
) {
  const { value, format, ...otherProps } = props;

  return (
    <EnhancedSelectInputSelectedValue
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        overflow: 'hidden',
      }}
      {...otherProps}
    >
      <Box sx={{ display: 'flex' }}>{value}</Box>

      {format == null ? null : (
        <Box
          sx={{
            flex: '0 0 auto',
            ml: '15px',
            color: 'var(--gray)',
            textAlign: 'right',
            fontSize: 12,
          }}
        >
          {format}
        </Box>
      )}
    </EnhancedSelectInputSelectedValue>
  );
}

export default SeriesTypeSelectInputSelectedValue;
