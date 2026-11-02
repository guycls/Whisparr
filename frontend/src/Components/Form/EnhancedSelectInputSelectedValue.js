import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React from 'react';

function EnhancedSelectInputSelectedValue(props) {
  const {
    className,
    children,
    isDisabled,
    sx
  } = props;

  return (
    <Box
      className={className}
      sx={[
        {
          flex: '1 1 auto',
          color: isDisabled ? 'text.disabled' : undefined
        },
        ...(Array.isArray(sx) ? sx : [sx])
      ]}
    >
      {children}
    </Box>
  );
}

EnhancedSelectInputSelectedValue.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  isDisabled: PropTypes.bool.isRequired,
  sx: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.func])
};

EnhancedSelectInputSelectedValue.defaultProps = {
  isDisabled: false
};

export default EnhancedSelectInputSelectedValue;
