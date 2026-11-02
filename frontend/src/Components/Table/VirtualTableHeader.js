import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React from 'react';

function VirtualTableHeader({ children }) {
  return (
    <Box sx={{ display: 'flex' }}>
      {children}
    </Box>
  );
}

VirtualTableHeader.propTypes = {
  children: PropTypes.node
};

export default VirtualTableHeader;
