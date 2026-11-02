import CircularProgress from '@mui/material/CircularProgress';
import React, { ReactNode } from 'react';
import Button, { ButtonProps } from './Button';

interface SpinnerButtonProps extends ButtonProps {
  isSpinning?: boolean;
  spinnerIcon?: object;
  children?: ReactNode;
}

function SpinnerButton({
  isSpinning = false,
  isDisabled,
  children,
  ...otherProps
}: SpinnerButtonProps) {
  return (
    <Button isDisabled={isDisabled || isSpinning} {...otherProps}>
      {isSpinning ? (
        <CircularProgress color="inherit" size={16} sx={{ mr: 1 }} />
      ) : null}
      {children}
    </Button>
  );
}

export default SpinnerButton;
