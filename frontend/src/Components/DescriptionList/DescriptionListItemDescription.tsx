import Box from '@mui/material/Box';
import React, { ReactNode } from 'react';

export interface DescriptionListItemDescriptionProps {
  className?: string;
  children?: ReactNode;
}

function DescriptionListItemDescription({
  className,
  children,
}: DescriptionListItemDescriptionProps) {
  return (
    <Box
      className={className}
      component="dd"
      sx={{
        ml: 0,
        lineHeight: 1.528571429,
        overflowWrap: 'break-word',
        '@media (min-width: 768px)': {
          ml: '180px',
        },
      }}
    >
      {children}
    </Box>
  );
}

export default DescriptionListItemDescription;
