import MuiTableRow from '@mui/material/TableRow';
import PropTypes from 'prop-types';
import React from 'react';

function TableRow(props) {
  const {
    className,
    children,
    ...otherProps
  } = props;

  return (
    <MuiTableRow
      className={className}
      hover={true}
      {...otherProps}
    >
      {children}
    </MuiTableRow>
  );
}

TableRow.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  overlayContent: PropTypes.bool,
  sx: PropTypes.any
};

export default TableRow;
