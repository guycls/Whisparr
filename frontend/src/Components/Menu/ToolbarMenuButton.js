import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import PropTypes from 'prop-types';
import React from 'react';
import Icon from 'Components/Icon';
import MenuButton from 'Components/Menu/MenuButton';

function ToolbarMenuButton(props) {
  const {
    iconName,
    showIndicator,
    text,
    ...otherProps
  } = props;

  return (
    <MenuButton
      {...otherProps}
      sx={{
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '2px',
        width: 72,
        minWidth: 72,
        maxWidth: 72,
        height: 56,
        minHeight: 56,
        m: 0,
        p: '6px 4px 4px',
        border: 'none',
        borderRadius: 1,
        color: 'inherit',
        lineHeight: 1,
        overflow: 'hidden',
        textTransform: 'none',
        whiteSpace: 'normal',
        '&.MuiButton-outlined, &.MuiButton-text, &.MuiButton-contained': {
          border: 'none'
        },
        '&:hover': {
          border: 'none',
          backgroundColor: 'action.hover',
          color: 'primary.main'
        }
      }}
    >
      <Stack
        spacing={0.25}
        sx={{ alignItems: 'center', width: '100%', lineHeight: 1 }}
      >
        <Badge
          color="error"
          variant="dot"
          invisible={!showIndicator}
        >
          <Icon
            name={iconName}
            size={21}
          />
        </Badge>
        {
          text &&
            <Box
              component="span"
              sx={{
                width: '100%',
                height: 24,
                px: '3px',
                overflow: 'hidden',
                color: 'text.secondary',
                fontSize: 11,
                lineHeight: '12px',
                textAlign: 'center',
                whiteSpace: 'normal'
              }}
            >
              {text}
            </Box>
        }
      </Stack>
    </MenuButton>
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
