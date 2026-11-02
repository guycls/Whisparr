import Box from '@mui/material/Box';
import React, { useCallback, useEffect, useState } from 'react';

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
  const [currentProgress, setCurrentProgress] = useState(0);
  const raf = React.useRef<number>(0);
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = Math.PI * (radius * 2);
  const sizeInPixels = `${size}px`;
  const strokeDashoffset = ((100 - currentProgress) / 100) * circumference;
  const progressText = `${Math.round(currentProgress)}%`;

  const handleAnimation = useCallback(
    (p: number) => {
      setCurrentProgress((prevProgress) => {
        if (prevProgress < p) {
          return prevProgress + Math.min(1, p - prevProgress);
        }

        return prevProgress;
      });
    },
    [setCurrentProgress]
  );

  useEffect(() => {
    if (progress > currentProgress) {
      cancelAnimationFrame(raf.current);

      raf.current = requestAnimationFrame(() => handleAnimation(progress));
    }
  }, [progress, currentProgress, handleAnimation]);

  useEffect(
    () => {
      return () => cancelAnimationFrame(raf.current);
    },
    // We only want to run this effect once
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <Box
      className={containerClassName}
      sx={{
        position: 'relative',
        display: 'inline-block',
        verticalAlign: 'top',
        textAlign: 'center',
        width: sizeInPixels,
        height: sizeInPixels,
        lineHeight: sizeInPixels,
      }}
    >
      <Box
        className={className}
        component="svg"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          transform: 'rotate(-90deg)',
          transformOrigin: 'center center',
        }}
      >
        <circle
          fill="transparent"
          r={radius}
          cx={center}
          cy={center}
          strokeDasharray={circumference}
          style={{
            stroke: strokeColor,
            strokeWidth,
            strokeDashoffset,
          }}
        />
      </Box>

      {showProgressText && (
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            fontWeight: 'bold',
          }}
        >
          {progressText}
        </Box>
      )}
    </Box>
  );
}

export default CircularProgressBar;
