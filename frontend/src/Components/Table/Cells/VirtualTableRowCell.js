import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React from 'react';

function VirtualTableRowCell(props) {
  const {
    className,
    children,
    sx
  } = props;

  return (
    <Box
      className={className}
      sx={[
        {
          overflow: 'hidden',
          maxWidth: '100%',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          padding: '8px',
          borderTop: '1px solid var(--borderColor)',
          lineHeight: 1.52857143,
          flexGrow: 0,
          flexShrink: 1
        },
        ...(Array.isArray(sx) ? sx : [sx])
      ]}
    >
      {children}
    </Box>
  );
}

VirtualTableRowCell.propTypes = {
  className: PropTypes.string,
  sx: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.func]),
  children: PropTypes.oneOfType([PropTypes.string, PropTypes.node])
};

export default VirtualTableRowCell;
