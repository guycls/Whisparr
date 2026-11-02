import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import React from 'react';
import { sizes } from 'Helpers/Props';

function FormLabel(props) {
  const {
    children,
    className,
    size,
    name,
    hasError,
    isAdvanced
  } = props;

  const minWidth = size === sizes.SMALL ? 150 : 250;

  return (
    <Typography
      className={className}
      component="label"
      htmlFor={name}
      variant="body2"
        color={hasError ? 'error' : 'text.primary'}
        sx={{
          display: 'block',
          minWidth: { lg: minWidth },
          mr: 2,
          pt: '9px',
          fontWeight: 500,
          fontStyle: isAdvanced ? 'italic' : 'normal'
        }}
    >
      {children}
    </Typography>
  );
}

FormLabel.propTypes = {
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.string]).isRequired,
  className: PropTypes.string,
  errorClassName: PropTypes.string,
  size: PropTypes.oneOf(sizes.all),
  name: PropTypes.string,
  hasError: PropTypes.bool,
  isAdvanced: PropTypes.bool
};

FormLabel.defaultProps = {
  isAdvanced: false,
  size: sizes.LARGE
};

export default FormLabel;
