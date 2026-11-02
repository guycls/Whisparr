import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import React, { ComponentProps } from 'react';
import { sizes } from 'Helpers/Props';
import { Size } from 'Helpers/Props/sizes';

interface FieldSetProps {
  size?: Size;
  legend?: ComponentProps<'legend'>['children'];
  children?: React.ReactNode;
}

function FieldSet({ size = sizes.MEDIUM, legend, children }: FieldSetProps) {
  return (
    <Box
      component="fieldset"
      sx={{
        m: 0,
        mb: 4,
        p: 0,
        border: 0,
        minWidth: 0,
      }}
    >
      {legend ? (
        <Typography
          component="legend"
          variant="subtitle1"
          sx={{
            display: 'block',
            float: 'none',
            width: '100%',
            mb: 2,
            pb: 1,
            borderBottom: 1,
            borderColor: 'divider',
            color: 'text.primary',
            fontWeight: 500,
            fontSize: size === sizes.SMALL ? 15 : 16,
            lineHeight: 1.4,
          }}
        >
          {legend}
        </Typography>
      ) : null}
      {children}
    </Box>
  );
}

export default FieldSet;
