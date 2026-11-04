import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Icon from 'Components/Icon';
import { withUrlBase } from 'Components/Link/Link';
import { map } from 'Helpers/elementChildren';

class PageSidebarItem extends Component {

  //
  // Listeners

  onPress = () => {
    const {
      isChildItem,
      isParentItem,
      onPress
    } = this.props;

    if ((isChildItem || !isParentItem) && onPress) {
      onPress();
    }
  };

  //
  // Render

  render() {
    const {
      iconName,
      title,
      to,
      isActive,
      isActiveParent,
      isChildItem,
      statusComponent: StatusComponent,
      children
    } = this.props;

    const label = typeof title === 'function' ? title() : title;

    const button = (
      <ListItem disablePadding>
        <ListItemButton
          component={RouterLink}
          to={withUrlBase(to)}
          selected={isActive || isActiveParent}
          onClick={this.onPress}
          sx={{
            ...(isChildItem ? { pl: '52px' } : null),
            '& .MuiListItemText-primary': {
              whiteSpace: 'nowrap'
            }
          }}
        >
          {
            !!iconName &&
              <ListItemIcon>
                <Icon
                  name={iconName}
                  size={24}
                />
              </ListItemIcon>
          }

          <ListItemText primary={label} />

          {
            !!StatusComponent &&
              <StatusComponent />
          }
        </ListItemButton>
      </ListItem>
    );

    if (!children) {
      return button;
    }

    return (
      <>
        {button}
        {
          map(children, (child) => {
            return React.cloneElement(child, { isChildItem: true });
          })
        }
      </>
    );
  }
}

PageSidebarItem.propTypes = {
  iconName: PropTypes.object,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
  to: PropTypes.string.isRequired,
  isActive: PropTypes.bool,
  isActiveParent: PropTypes.bool,
  isParentItem: PropTypes.bool.isRequired,
  isChildItem: PropTypes.bool.isRequired,
  statusComponent: PropTypes.elementType,
  children: PropTypes.node,
  onPress: PropTypes.func
};

PageSidebarItem.defaultProps = {
  isChildItem: false
};

export default PageSidebarItem;
