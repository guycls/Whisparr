import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import React from 'react';

interface CircularProgressBarProps {
  className?: string;
  containerClassName?: string;
  size?: number;
  progress: number;
  strokeWidth?: number;
  strokeColor?: string;
  showProgressText?: boolean;
}

function CircularProgressBar({
  className,
  containerClassName,
  size = 60,
  strokeWidth = 5,
  strokeColor = '#35c5f4',
  showProgressText = false,
  progress,
}: CircularProgressBarProps) {
  const value = Math.max(0, Math.min(100, progress));

  return (
    <Box
      className={containerClassName}
      sx={{
        position: 'relative',
        display: 'inline-flex',
        verticalAlign: 'top',
        width: size,
        height: size,
      }}
    >
      <CircularProgress
        className={className}
        variant="determinate"
        value={value}
        size={size}
        thickness={strokeWidth}
        sx={{ color: strokeColor }}
      />

      {showProgressText && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
          }}
        >
          {`${Math.round(value)}%`}
        </Box>
      )}
    </Box>
  );
}

export default CircularProgressBar;
