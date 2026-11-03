import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import Icon from 'Components/Icon';
import MenuButton from 'Components/Menu/MenuButton';
import ToolbarIconSlot, { TOOLBAR_ICON_SIZE, ToolbarOverflowContext, toolbarButtonSx, toolbarOverflowItemSx } from 'Components/Page/Toolbar/ToolbarIconSlot';
import Tooltip from 'Components/Tooltip/Tooltip';
import { tooltipPositions } from 'Helpers/Props';

function ToolbarMenuButton(props) {
  const {
    iconName,
    showIndicator,
    text,
    ...otherProps
  } = props;

  const inOverflow = useContext(ToolbarOverflowContext);

  if (inOverflow) {
    return (
      <MenuButton
        aria-label={text}
        {...otherProps}
        sx={toolbarOverflowItemSx}
      >
        <Badge
          color="error"
          variant="dot"
          invisible={!showIndicator}
          sx={{
            '& .MuiBadge-badge': {
              right: -2,
              top: 2
            }
          }}
        >
          <ToolbarIconSlot>
            <Icon
              name={iconName}
              size={TOOLBAR_ICON_SIZE}
            />
          </ToolbarIconSlot>
        </Badge>
        {
          text ?
            <Box component="span">{text}</Box> :
            null
        }
      </MenuButton>
    );
  }

  const button = (
    <MenuButton
      aria-label={text}
      {...otherProps}
      sx={toolbarButtonSx}
    >
      <Badge
        color="error"
        variant="dot"
        invisible={!showIndicator}
        sx={{
          '& .MuiBadge-badge': {
            right: -2,
            top: 2
          }
        }}
      >
        <ToolbarIconSlot>
          <Icon
            name={iconName}
            size={TOOLBAR_ICON_SIZE}
          />
        </ToolbarIconSlot>
      </Badge>
    </MenuButton>
  );

  if (!text) {
    return button;
  }

  return (
    <Tooltip
      position={tooltipPositions.TOP}
      tooltip={text}
      anchor={button}
    />
  );
}

ToolbarMenuButton.propTypes = {
  iconName: PropTypes.object.isRequired,
  showIndicator: PropTypes.bool.isRequired,
  text: PropTypes.string
};

ToolbarMenuButton.defaultProps = {
  showIndicator: false
};

export default ToolbarMenuButton;
