import Divider from '@mui/material/Divider';
import React from 'react';

function PageToolbarSeparator() {
  return (
    <Divider
      orientation="vertical"
      flexItem={true}
      sx={{
        alignSelf: 'center',
        height: 28,
        mx: '2px'
      }}
    />
  );
}

export default PageToolbarSeparator;
