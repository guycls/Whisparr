import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React from 'react';

export const TOOLBAR_ICON_SIZE = 21;
export const TOOLBAR_BUTTON_WIDTH = 40;
export const ToolbarOverflowContext = React.createContext(false);

export const toolbarOverflowItemSx = {
  display: 'inline-flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  gap: 1,
  width: '100%',
  minWidth: 180,
  maxWidth: 'none',
  height: 40,
  minHeight: 40,
  m: 0,
  px: 2,
  py: 0,
  border: 'none',
  borderRadius: 0,
  color: 'inherit',
  lineHeight: 1,
  textTransform: 'none',
  whiteSpace: 'nowrap',
  '&.MuiButton-outlined, &.MuiButton-text, &.MuiButton-contained': {
    border: 'none'
  },
  '&:hover': {
    border: 'none',
    backgroundColor: 'action.hover',
    color: 'primary.main'
  }
};

export const toolbarButtonSx = {
  display: 'inline-flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: TOOLBAR_BUTTON_WIDTH,
  minWidth: TOOLBAR_BUTTON_WIDTH,
  maxWidth: TOOLBAR_BUTTON_WIDTH,
  height: TOOLBAR_BUTTON_WIDTH,
  minHeight: TOOLBAR_BUTTON_WIDTH,
  m: 0,
  p: 0,
  border: 'none',
  borderRadius: 1,
  color: 'inherit',
  lineHeight: 0,
  overflow: 'hidden',
  textTransform: 'none',
  '&.MuiButton-outlined, &.MuiButton-text, &.MuiButton-contained': {
    border: 'none'
  },
  '&:hover': {
    border: 'none',
    backgroundColor: 'action.hover',
    color: 'primary.main'
  }
};

function ToolbarIconSlot(props) {
  const { children } = props;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: TOOLBAR_ICON_SIZE,
        height: TOOLBAR_ICON_SIZE,
        flexShrink: 0,
        lineHeight: 0,
        '& .MuiSvgIcon-root, & .MuiCircularProgress-root': {
          fontSize: TOOLBAR_ICON_SIZE,
          width: TOOLBAR_ICON_SIZE,
          height: TOOLBAR_ICON_SIZE,
        },
      }}
    >
      {children}
    </Box>
  );
}

ToolbarIconSlot.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ToolbarIconSlot;
