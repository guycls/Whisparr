import { ButtonProps } from '@mui/material/Button';
import { SxProps, Theme } from '@mui/material/styles';
import { Align } from './align';
import * as kinds from './kinds';
import { Kind } from './kinds';
import * as sizes from './sizes';
import { Size } from './sizes';

export function kindToColor(kind?: Kind): ButtonProps['color'] {
  switch (kind) {
    case kinds.DANGER:
      return 'error';
    case kinds.SUCCESS:
      return 'success';
    case kinds.WARNING:
      return 'warning';
    case kinds.INFO:
      return 'info';
    case kinds.PRIMARY:
    case kinds.PINK:
    case kinds.PURPLE:
      return 'primary';
    default:
      return 'inherit';
  }
}

export function kindToVariant(kind?: Kind): ButtonProps['variant'] {
  switch (kind) {
    case kinds.DEFAULT:
    case kinds.INVERSE:
    case kinds.DISABLED:
      return 'outlined';
    case undefined:
      return 'text';
    default:
      return 'contained';
  }
}

export function sizeToButtonSize(size?: Size): ButtonProps['size'] {
  switch (size) {
    case sizes.EXTRA_SMALL:
    case sizes.SMALL:
      return 'small';
    case sizes.LARGE:
    case sizes.EXTRA_LARGE:
    case sizes.EXTRA_EXTRA_LARGE:
      return 'large';
    default:
      return 'medium';
  }
}

export function sizeToDialogMaxWidth(
  size?: Size
): 'xs' | 'sm' | 'md' | 'lg' | 'xl' {
  switch (size) {
    case sizes.EXTRA_SMALL:
      return 'xs';
    case sizes.SMALL:
      return 'sm';
    case sizes.LARGE:
      return 'lg';
    case sizes.EXTRA_LARGE:
    case sizes.EXTRA_EXTRA_LARGE:
      return 'xl';
    default:
      return 'md';
  }
}

export function groupPositionSx(position?: Align): SxProps<Theme> | undefined {
  switch (position) {
    case 'left':
      return { borderTopRightRadius: 0, borderBottomRightRadius: 0 };
    case 'right':
      return { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 };
    case 'center':
      return { borderRadius: 0 };
    default:
      return undefined;
  }
}

export function formGroupMaxWidth(size?: Size) {
  switch (size) {
    case sizes.EXTRA_SMALL:
      return 550;
    case sizes.SMALL:
      return 650;
    case sizes.MEDIUM:
      return 800;
    case sizes.LARGE:
    case sizes.EXTRA_LARGE:
    case sizes.EXTRA_EXTRA_LARGE:
      return 1200;
    default:
      return 650;
  }
}
