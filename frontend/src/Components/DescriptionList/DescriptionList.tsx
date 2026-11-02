import Box from '@mui/material/Box';
import React from 'react';

interface DescriptionListProps {
  className?: string;
  children?: React.ReactNode;
}

function DescriptionList({ className, children }: DescriptionListProps) {
  return (
    <Box className={className} component="dl" sx={{ mt: 0, mb: 0 }}>
      {children}
    </Box>
  );
}

export default DescriptionList;
