import Box from '@mui/material/Box';
import React from 'react';
import MenuItem from 'Components/Menu/MenuItem';
import SpinnerIcon from 'Components/SpinnerIcon';
import type { IconName } from 'Helpers/Props/icons';

interface PageToolbarOverflowMenuItemProps {
  iconName: IconName;
  spinningName?: IconName;
  isDisabled?: boolean;
  isSpinning?: boolean;
  showIndicator?: boolean;
  label: string;
  text?: string;
  onPress: () => void;
}

function PageToolbarOverflowMenuItem(props: PageToolbarOverflowMenuItemProps) {
  const {
    iconName,
    spinningName,
    label,
    isDisabled,
    isSpinning = false,
    ...otherProps
  } = props;

  return (
    <MenuItem key={label} isDisabled={isDisabled || isSpinning} {...otherProps}>
      <Box
        component="span"
        sx={{ display: 'inline-flex', mr: 1 }}
      >
        <SpinnerIcon
          name={iconName}
          spinningName={spinningName}
          isSpinning={isSpinning}
        />
      </Box>
      {label}
    </MenuItem>
  );
}

export default PageToolbarOverflowMenuItem;
