import MuiButton from '@mui/material/Button';
import MuiLink from '@mui/material/Link';
import { SxProps, Theme } from '@mui/material/styles';
import React, {
  ElementType,
  HTMLProps,
  ReactNode,
  SyntheticEvent,
  useCallback,
} from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Align } from 'Helpers/Props/align';
import { Kind } from 'Helpers/Props/kinds';
import {
  groupPositionSx,
  kindToColor,
  kindToVariant,
  sizeToButtonSize,
} from 'Helpers/Props/muiKind';
import { Size } from 'Helpers/Props/sizes';

const externalUrlRegex = /\w+?:\/\//;

export function withUrlBase(to: string) {
  return `${window.Whisparr.urlBase}/${to.replace(/^\//, '')}`;
}

export interface LinkProps
  extends Omit<HTMLProps<HTMLElement>, 'size' | 'ref' | 'onClick'> {
  className?: string;
  component?: ElementType;
  to?: string;
  target?: string;
  type?: string;
  isDisabled?: boolean;
  noRouter?: boolean;
  kind?: Kind;
  size?: Size;
  buttonGroupPosition?: Align;
  sx?: SxProps<Theme>;
  children?: ReactNode;
  onPress?(event: SyntheticEvent): void;
}

function Link(props: LinkProps) {
  const {
    className,
    component,
    to,
    target,
    type,
    isDisabled,
    noRouter = false,
    onPress,
    kind,
    size,
    buttonGroupPosition,
    sx: sxProp,
    children,
    ...otherProps
  } = props;

  const onClick = useCallback(
    (event: SyntheticEvent) => {
      if (isDisabled) {
        event.preventDefault();

        return;
      }

      if (onPress) {
        onPress(event);
      }
    },
    [isDisabled, onPress]
  );

  const sx = [groupPositionSx(buttonGroupPosition), sxProp].filter(
    Boolean
  ) as SxProps<Theme>;

  if (to && externalUrlRegex.test(to)) {
    return (
      <MuiLink
        className={className}
        href={to}
        target={target || '_blank'}
        rel="noreferrer"
        underline="hover"
        onClick={onClick}
        sx={sx}
        {...otherProps}
      >
        {children}
      </MuiLink>
    );
  }

  if (to && noRouter) {
    return (
      <MuiLink
        className={className}
        href={to}
        target={target || '_self'}
        underline="hover"
        onClick={onClick}
        sx={sx}
        {...otherProps}
      >
        {children}
      </MuiLink>
    );
  }

  if (to) {
    return (
      <MuiLink
        className={className}
        component={RouterLink}
        to={withUrlBase(to)}
        target={target}
        underline="hover"
        onClick={onClick}
        sx={sx}
        {...otherProps}
      >
        {children}
      </MuiLink>
    );
  }

  const isNativeButton = !component || component === 'button';

  const buttonSx = [{ textTransform: 'none' }, sx].flat() as SxProps<Theme>;

  const buttonProps = {
    ...otherProps,
    className,
    type: isNativeButton ? type || 'button' : undefined,
    disabled: isNativeButton ? !!isDisabled : undefined,
    'aria-disabled': isNativeButton ? undefined : isDisabled || undefined,
    variant: kindToVariant(kind),
    color: kindToColor(kind),
    size: sizeToButtonSize(size),
    onClick,
    sx: buttonSx,
    children,
  };

  if (component) {
    return (
      <MuiButton
        {...(buttonProps as React.ComponentProps<typeof MuiButton>)}
        component={component}
      />
    );
  }

  return (
    <MuiButton {...(buttonProps as React.ComponentProps<typeof MuiButton>)} />
  );
}

export default Link;
