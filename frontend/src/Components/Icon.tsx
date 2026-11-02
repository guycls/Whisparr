import {
  FontAwesomeIcon,
  FontAwesomeIconProps,
} from '@fortawesome/react-fontawesome';
import { Theme, useTheme } from '@mui/material/styles';
import React, { ComponentProps } from 'react';
import { kinds } from 'Helpers/Props';
import { Kind } from 'Helpers/Props/kinds';

export interface IconProps
  extends Omit<
    FontAwesomeIconProps,
    'icon' | 'spin' | 'name' | 'title' | 'size'
  > {
  containerClassName?: ComponentProps<'span'>['className'];
  name: FontAwesomeIconProps['icon'];
  kind?: Kind;
  size?: number;
  isSpinning?: FontAwesomeIconProps['spin'];
  title?: string | (() => string);
  darken?: boolean;
}

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
  name,
  kind = kinds.DEFAULT,
  size = 14,
  title,
  isSpinning = false,
  fixedWidth = false,
  darken = false,
  ...otherProps
}: IconProps) {
  const theme = useTheme();
  const icon = (
    <FontAwesomeIcon
      className={className}
      icon={name}
      spin={isSpinning}
      fixedWidth={fixedWidth}
      style={{
        fontSize: `${size}px`,
        color: kindColor(kind, theme.palette),
        opacity: darken ? 0.7 : undefined,
      }}
      {...otherProps}
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
