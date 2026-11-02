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

    return (
      <div>
        <ListItemButton
          component={RouterLink}
          to={withUrlBase(to)}
          selected={isActive || isActiveParent}
          onClick={this.onPress}
          sx={{
            mx: 0.75,
            my: '2px',
            width: 'auto',
            minHeight: 36,
            borderRadius: 1,
            pl: isChildItem ? 3.5 : 1.25,
            pr: 1,
            '&.Mui-selected': {
              bgcolor: 'action.selected',
            },
            '&.Mui-selected:hover': {
              bgcolor: 'action.selected',
            },
          }}
        >
          {
            !!iconName &&
              <ListItemIcon sx={{ minWidth: 28 }}>
                <Icon name={iconName} />
              </ListItemIcon>
          }

          <ListItemText
            primary={label}
            slotProps={{
              primary: {
                sx: {
                  whiteSpace: 'normal',
                  lineHeight: 1.3,
                },
              },
            }}
          />

          {
            !!StatusComponent &&
              <StatusComponent />
          }
        </ListItemButton>

        {
          children &&
            map(children, (child) => {
              return React.cloneElement(child, { isChildItem: true });
            })
        }
      </div>
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
