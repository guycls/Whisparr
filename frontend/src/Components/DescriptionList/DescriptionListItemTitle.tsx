import Box from '@mui/material/Box';
import React, { ReactNode } from 'react';

export interface DescriptionListItemTitleProps {
  className?: string;
  children?: ReactNode;
}

function DescriptionListItemTitle({
  className,
  children,
}: DescriptionListItemTitleProps) {
  return (
    <Box
      className={className}
      component="dt"
      sx={{
        fontWeight: 'bold',
        lineHeight: 1.528571429,
        '@media (min-width: 768px)': {
          overflow: 'hidden',
          maxWidth: '100%',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          float: 'left',
          clear: 'left',
          width: 160,
          textAlign: 'right',
        },
      }}
    >
      {children}
    </Box>
  );
}

export default DescriptionListItemTitle;
