import MuiTableBody from '@mui/material/TableBody';
import PropTypes from 'prop-types';
import React from 'react';

function TableBody({ children, ...otherProps }) {
  return (
    <MuiTableBody {...otherProps}>
      {children}
    </MuiTableBody>
  );
}

TableBody.propTypes = {
  children: PropTypes.node
};

export default TableBody;
