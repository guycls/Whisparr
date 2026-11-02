import Stack from '@mui/material/Stack';
import PropTypes from 'prop-types';
import React from 'react';
import { map } from 'Helpers/elementChildren';
import { sizes } from 'Helpers/Props';
import { formGroupMaxWidth } from 'Helpers/Props/muiKind';

function FormGroup(props) {
  const {
    className,
    children,
    size,
    advancedSettings,
    isAdvanced,
    sx,
    ...otherProps
  } = props;

  if (!advancedSettings && isAdvanced) {
    return null;
  }

  const childProps = isAdvanced ? { isAdvanced } : {};

  return (
    <Stack
      className={className}
      direction={{ xs: 'column', lg: 'row' }}
      spacing={1}
      sx={{
        mb: 2.5,
        maxWidth: formGroupMaxWidth(size),
        ...(sx && typeof sx === 'object' && !Array.isArray(sx) ? sx : null)
      }}
      {...otherProps}
    >
      {
        map(children, (child) => {
          return React.cloneElement(child, childProps);
        })
      }
    </Stack>
  );
}

FormGroup.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(sizes.all).isRequired,
  advancedSettings: PropTypes.bool.isRequired,
  isAdvanced: PropTypes.bool.isRequired,
  sx: PropTypes.object
};

FormGroup.defaultProps = {
  size: sizes.SMALL,
  advancedSettings: false,
  isAdvanced: false
};

export default FormGroup;
