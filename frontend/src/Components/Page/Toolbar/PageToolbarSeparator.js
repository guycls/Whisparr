import Box from '@mui/material/Box';
import React from 'react';

function PageToolbarSeparator() {
  return (
    <Box
      sx={{
        alignSelf: 'center',
        flexShrink: 0,
        height: 28,
        mx: '2px',
        borderRight: 1,
        borderColor: 'divider'
      }}
    />
  );
}

export default PageToolbarSeparator;
