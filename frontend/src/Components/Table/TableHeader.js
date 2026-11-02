import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import PropTypes from 'prop-types';
import React from 'react';

function TableHeader(props) {
  return (
    <TableHead>
      <TableRow>
        {props.children}
      </TableRow>
    </TableHead>
  );
}

TableHeader.propTypes = {
  children: PropTypes.node
};

export default TableHeader;
