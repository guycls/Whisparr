import Box from '@mui/material/Box';
import React from 'react';

interface DragPreviewLayerProps {
  className?: string;
  children?: React.ReactNode;
}

function DragPreviewLayer({
  className,
  children,
  ...otherProps
}: DragPreviewLayerProps) {
  return (
    <Box
      className={className}
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
      {...otherProps}
    >
      {children}
    </Box>
  );
}

export default DragPreviewLayer;
