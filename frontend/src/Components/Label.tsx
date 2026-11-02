import Chip from '@mui/material/Chip';
import React, { ComponentProps, ReactNode } from 'react';
import { kinds, sizes } from 'Helpers/Props';
import { Kind } from 'Helpers/Props/kinds';
import { kindToColor, sizeToButtonSize } from 'Helpers/Props/muiKind';
import { Size } from 'Helpers/Props/sizes';

export interface LabelProps extends Omit<ComponentProps<'span'>, 'color'> {
  kind?: Kind;
  size?: Size;
  outline?: boolean;
  children: ReactNode;
}

export default function Label({
  className,
  kind = kinds.DEFAULT,
  size = sizes.SMALL,
  outline = false,
  children,
}: LabelProps) {
  const color = kindToColor(kind);

  return (
    <Chip
      className={className}
      label={children}
      size={sizeToButtonSize(size) === 'large' ? 'medium' : 'small'}
      color={color === 'inherit' ? 'default' : color}
      variant={outline || kind === kinds.DEFAULT ? 'outlined' : 'filled'}
    />
  );
}
