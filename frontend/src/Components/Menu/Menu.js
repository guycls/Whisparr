import Box from '@mui/material/Box';
import MuiMenu from '@mui/material/Menu';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { align } from 'Helpers/Props';

export const MenuCloseContext = React.createContext(() => {});

const HOVER_CLOSE_DELAY = 160;

function isMousePointer(event) {
  return !event.pointerType || event.pointerType === 'mouse';
}

function Menu(props) {
  const {
    className,
    children,
    alignMenu,
    openOnHover
  } = props;

  const [anchorEl, setAnchorEl] = useState(null);
  const closeTimer = useRef(null);
  const openedByHover = useRef(false);
  const childrenArray = React.Children.toArray(children);
  const button = childrenArray[0];
  const content = childrenArray[1];
  const items = content && content.type && content.type.displayName === 'MenuContent' ?
    content.props.children :
    content;

  const horizontal = alignMenu === align.RIGHT ? 'right' : 'left';

  const cancelClose = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const onClose = () => {
    cancelClose();
    openedByHover.current = false;
    setAnchorEl(null);
  };

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const scheduleClose = (event) => {
    if (!openOnHover || (event && !isMousePointer(event)) || event?.buttons) {
      return;
    }

    cancelClose();
    closeTimer.current = window.setTimeout(() => {
      openedByHover.current = false;
      setAnchorEl(null);
    }, HOVER_CLOSE_DELAY);
  };

  const onOpen = (event) => {
    cancelClose();
    setAnchorEl(event.currentTarget);
  };

  const onPointerEnter = (event) => {
    if (!openOnHover || !isMousePointer(event)) {
      return;
    }

    openedByHover.current = true;
    onOpen(event);
  };

  const onPress = (event) => {
    cancelClose();

    if (anchorEl && !openedByHover.current) {
      onClose();
      return;
    }

    openedByHover.current = false;
    onOpen(event);
  };

  useEffect(() => cancelClose, []);

  useEffect(() => {
    if (!openOnHover || !anchorEl) {
      return undefined;
    }

    const onPointerUp = (event) => {
      const target = event.target;

      if (!(target instanceof Node)) {
        onCloseRef.current();
        return;
      }

      if (anchorEl.contains(target)) {
        return;
      }

      const paper = document.querySelector('.MuiMenu-paper');

      if (paper?.contains(target)) {
        return;
      }

      onCloseRef.current();
    };

    window.addEventListener('pointerup', onPointerUp);

    return () => window.removeEventListener('pointerup', onPointerUp);
  }, [openOnHover, anchorEl]);

  return (
    <MenuCloseContext.Provider value={onClose}>
      <Box
        className={className}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          height: '100%'
        }}
      >
        {
          button &&
            React.cloneElement(button, {
              onPress,
              onPointerEnter,
              onPointerLeave: scheduleClose
            })
        }

        <MuiMenu
          anchorEl={anchorEl}
          open={!!anchorEl}
          onClose={onClose}
          anchorOrigin={{ vertical: 'bottom', horizontal }}
          transformOrigin={{ vertical: 'top', horizontal }}
          {...(openOnHover ?
            {
              autoFocus: false,
              disableAutoFocus: true,
              disableAutoFocusItem: true,
              disableEnforceFocus: true,
              disableRestoreFocus: true,
              disableScrollLock: true,
              hideBackdrop: true
            } :
            null)}
          slotProps={{
            root: openOnHover ?
              {
                sx: { pointerEvents: 'none' }
              } :
              undefined,
            paper: {
              onPointerEnter: openOnHover ? cancelClose : undefined,
              onPointerLeave: openOnHover ? scheduleClose : undefined,
              sx: openOnHover ?
                {
                  pointerEvents: 'auto',
                  mt: '-8px'
                } :
                undefined
            }
          }}
        >
          {items}
        </MuiMenu>
      </Box>
    </MenuCloseContext.Provider>
  );
}

Menu.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  alignMenu: PropTypes.oneOf([align.LEFT, align.RIGHT]),
  enforceMaxHeight: PropTypes.bool,
  openOnHover: PropTypes.bool
};

Menu.defaultProps = {
  alignMenu: align.LEFT,
  enforceMaxHeight: true,
  openOnHover: false
};

export default Menu;
