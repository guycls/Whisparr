import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import React from 'react';
import { Kind } from 'Helpers/Props/kinds';
import { kindToColor } from 'Helpers/Props/muiKind';
import { Size } from 'Helpers/Props/sizes';
import translate from 'Utilities/String/translate';

interface ProgressBarProps {
  className?: string;
  containerClassName?: string;
  title?: string;
  progress: number;
  precision?: number;
  showText?: boolean;
  text?: string;
  kind?: Kind;
  size?: Size;
  width?: number;
}

function barHeight(size?: Size) {
  switch (size) {
    case 'small':
    case 'extraSmall':
      return 6;
    case 'large':
    case 'extraLarge':
    case 'extraExtraLarge':
      return 20;
    default:
      return 12;
  }
}

function ProgressBar({
  className,
  title,
  progress,
  precision = 1,
  showText = false,
  text,
  kind = 'primary',
  size = 'medium',
  width,
}: ProgressBarProps) {
  const progressPercent = Number(progress.toFixed(precision));
  const progressText = text || `${progressPercent}%`;
  const color = kindToColor(kind);
  const keepsStatusBlue =
    kind === 'primary' || kind === 'pink' || kind === 'purple';

  return (
    <Box
      className={className}
      title={title}
      sx={{ position: 'relative', width: width || '100%' }}
    >
      <LinearProgress
        variant="determinate"
        value={Math.max(0, Math.min(100, progress))}
        color={color === 'inherit' ? 'primary' : color}
        sx={{
          height: barHeight(size),
          borderRadius: 1,
          ...(keepsStatusBlue
            ? {
                bgcolor: 'rgba(25, 118, 210, 0.2)',
                '& .MuiLinearProgress-bar': {
                  bgcolor: '#1976d2',
                },
              }
            : {}),
        }}
        aria-label={translate('ProgressBarProgress', {
          progress: progress.toFixed(0),
        })}
      />
      {showText ? (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
          }}
        >
          {progressText}
        </Box>
      ) : null}
    </Box>
  );
}

export default ProgressBar;
