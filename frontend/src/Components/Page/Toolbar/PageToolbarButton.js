import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import Icon from 'Components/Icon';
import Button from 'Components/Link/Button';
import Tooltip from 'Components/Tooltip/Tooltip';
import { icons, kinds, tooltipPositions } from 'Helpers/Props';
import ToolbarIconSlot, { TOOLBAR_ICON_SIZE, ToolbarOverflowContext, toolbarButtonSx, toolbarOverflowItemSx } from './ToolbarIconSlot';

function PageToolbarButton(props) {
  const {
    label,
    iconName,
    spinningName,
    isDisabled,
    isSpinning,
    title,
    ...otherProps
  } = props;

  const inOverflow = useContext(ToolbarOverflowContext);
  const icon = (
    <ToolbarIconSlot>
      <Icon
        name={isSpinning ? (spinningName || iconName) : iconName}
        isSpinning={isSpinning}
        size={TOOLBAR_ICON_SIZE}
      />
    </ToolbarIconSlot>
  );

  if (inOverflow) {
    return (
      <Button
        aria-label={label}
        kind={kinds.DEFAULT}
        isDisabled={isDisabled || isSpinning}
        {...otherProps}
        sx={toolbarOverflowItemSx}
      >
        {icon}
        <Box component="span">{label}</Box>
      </Button>
    );
  }

  return (
    <Tooltip
      position={tooltipPositions.BOTTOM}
      tooltip={title || label}
      anchor={
        <Button
          aria-label={label}
          kind={kinds.DEFAULT}
          isDisabled={isDisabled || isSpinning}
          {...otherProps}
          sx={toolbarButtonSx}
        >
          {icon}
        </Button>
      }
    />
  );
}

PageToolbarButton.propTypes = {
  label: PropTypes.string.isRequired,
  iconName: PropTypes.object.isRequired,
  spinningName: PropTypes.object,
  title: PropTypes.string,
  isSpinning: PropTypes.bool,
  isDisabled: PropTypes.bool,
  onPress: PropTypes.func
};

PageToolbarButton.defaultProps = {
  spinningName: icons.SPINNER,
  isDisabled: false,
  isSpinning: false
};

export default PageToolbarButton;
