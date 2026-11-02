import CircularProgress from '@mui/material/CircularProgress';
import React from 'react';

interface LoadingIndicatorProps {
  className?: string;
  rippleClassName?: string;
  size?: number;
}

function LoadingIndicator({
  className,
  size = 50,
}: LoadingIndicatorProps) {
  return <CircularProgress className={className} size={size} />;
}

export default LoadingIndicator;
