import Toolbar from '@mui/material/Toolbar';
import PropTypes from 'prop-types';
import React from 'react';

function PageToolbar(props) {
  const {
    className,
    children
  } = props;

  return (
    <Toolbar
      className={className}
      variant="dense"
      disableGutters={true}
      sx={{
        flex: '0 0 auto',
        height: 56,
        minHeight: 56,
        justifyContent: 'space-between',
        alignItems: 'stretch',
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        px: { xs: '10px', md: '12px' }
      }}
    >
      {children}
    </Toolbar>
  );
}

PageToolbar.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired
};

export default PageToolbar;
