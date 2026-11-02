import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React from 'react';

function VirtualTableRow(props) {
  const {
    className,
    children,
    style,
    sx,
    ...otherProps
  } = props;

  return (
    <Box
      className={className}
      style={style}
      sx={[
        {
          display: 'flex',
          transition: 'background-color 500ms',
          '&:hover': {
            backgroundColor: 'var(--tableRowHoverBackgroundColor)'
          },
          '@media (max-width: 992px)': {
            overflowX: 'visible !important'
          }
        },
        ...(Array.isArray(sx) ? sx : [sx])
      ]}
      {...otherProps}
    >
      {children}
    </Box>
  );
}

VirtualTableRow.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,
  children: PropTypes.node
};

export default VirtualTableRow;
