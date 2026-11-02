import React from 'react';
import { kinds, sizes } from 'Helpers/Props';
import { Align } from 'Helpers/Props/align';
import { Kind } from 'Helpers/Props/kinds';
import { Size } from 'Helpers/Props/sizes';
import Link, { LinkProps } from './Link';

export interface ButtonProps extends Omit<LinkProps, 'children' | 'size'> {
  buttonGroupPosition?: Align;
  kind?: Kind;
  size?: Size;
  children?: LinkProps['children'];
}

export default function Button({
  buttonGroupPosition,
  kind = kinds.DEFAULT,
  size = sizes.MEDIUM,
  ...otherProps
}: ButtonProps) {
  return (
    <Link
      buttonGroupPosition={buttonGroupPosition}
      kind={kind}
      size={size}
      {...otherProps}
    />
  );
}
