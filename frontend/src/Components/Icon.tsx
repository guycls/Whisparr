import CircularProgress from '@mui/material/CircularProgress';
import { Theme, useTheme } from '@mui/material/styles';
import React, { ComponentProps } from 'react';
import { icons, kinds } from 'Helpers/Props';
import type { IconName } from 'Helpers/Props/icons';
import { Kind } from 'Helpers/Props/kinds';

export interface IconProps {
  containerClassName?: ComponentProps<'span'>['className'];
  className?: string;
  name: IconName;
  kind?: Kind;
  size?: number;
  isSpinning?: boolean;
  title?: string | (() => string);
  fixedWidth?: boolean;
  darken?: boolean;
}

const spinAnimation = {
  animation: 'icon-spin 1s linear infinite',
  '@keyframes icon-spin': {
    from: { transform: 'rotate(0deg)' },
    to: { transform: 'rotate(360deg)' },
  },
};

function kindColor(kind: Kind, palette: Theme['palette']) {
  switch (kind) {
    case kinds.DANGER:
      return palette.error.main;
    case kinds.SUCCESS:
      return palette.success.main;
    case kinds.WARNING:
      return palette.warning.main;
    case kinds.INFO:
      return palette.info.main;
    case kinds.PRIMARY:
    case kinds.PINK:
    case kinds.PURPLE:
      return palette.primary.main;
    case kinds.DISABLED:
      return palette.text.disabled;
    default:
      return 'inherit';
  }
}

export default function Icon({
  containerClassName,
  className,
  name: IconComponent,
  kind = kinds.DEFAULT,
  size = 14,
  title,
  isSpinning = false,
  darken = false,
}: IconProps) {
  const theme = useTheme();
  const color = kindColor(kind, theme.palette);
  const opacity = darken ? 0.7 : undefined;

  if (!IconComponent) {
    return null;
  }

  const icon =
    isSpinning && IconComponent === icons.SPINNER ? (
      <CircularProgress
        className={className}
        size={size}
        sx={{
          color,
          opacity,
        }}
      />
    ) : (
      <IconComponent
        className={className}
        sx={{
          fontSize: size,
          color,
          opacity,
          ...(isSpinning ? spinAnimation : undefined),
        }}
      />
    );

  if (title) {
    return (
      <span
        className={containerClassName}
        title={typeof title === 'function' ? title() : title}
      >
        {icon}
      </span>
    );
  }

  return icon;
}
