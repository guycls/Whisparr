import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { align } from 'Helpers/Props';

export const MenuCloseContext = React.createContext(() => {});

function AppMenu(props) {
  const {
    className,
    children,
    alignMenu
  } = props;

  const [anchorEl, setAnchorEl] = useState(null);
  const childrenArray = React.Children.toArray(children);
  const button = childrenArray[0];
  const content = childrenArray[1];
  const items = content && content.type && content.type.displayName === 'MenuContent' ?
    content.props.children :
    content;

  const horizontal = alignMenu === align.RIGHT ? 'right' : 'left';

  const onOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const onClose = () => {
    setAnchorEl(null);
  };

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
              onPress: onOpen
            })
        }

        <Menu
          anchorEl={anchorEl}
          open={!!anchorEl}
          onClose={onClose}
          anchorOrigin={{ vertical: 'bottom', horizontal }}
          transformOrigin={{ vertical: 'top', horizontal }}
        >
          {items}
        </Menu>
      </Box>
    </MenuCloseContext.Provider>
  );
}

AppMenu.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  alignMenu: PropTypes.oneOf([align.LEFT, align.RIGHT]),
  enforceMaxHeight: PropTypes.bool
};

AppMenu.defaultProps = {
  alignMenu: align.LEFT,
  enforceMaxHeight: true
};

export default AppMenu;
