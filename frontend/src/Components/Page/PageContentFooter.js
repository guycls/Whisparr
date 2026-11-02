import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React from 'react';

function PageContentFooter(props) {
  const {
    className,
    children
  } = props;

  return (
    <Box
      className={className}
      sx={{
        flex: '0 0 auto',
        borderTop: 1,
        borderColor: 'divider'
      }}
    >
      {children}
    </Box>
  );
}

PageContentFooter.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired
};

export default PageContentFooter;
