import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Icon from 'Components/Icon';
import { icons } from 'Helpers/Props';
import MenuItem from './MenuItem';

class SelectedMenuItem extends Component {

  //
  // Listeners

  onPress = () => {
    const {
      name,
      onPress
    } = this.props;

    onPress(name);
  };

  //
  // Render

  render() {
    const {
      children,
      selectedIconName,
      isSelected,
      ...otherProps
    } = this.props;

    return (
      <MenuItem
        {...otherProps}
        onPress={this.onPress}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            whiteSpace: 'nowrap'
          }}
        >
          {children}

          <Box
            component="span"
            sx={{
              visibility: isSelected ? 'visible' : 'hidden',
              ml: '20px'
            }}
          >
            <Icon
              name={selectedIconName}
            />
          </Box>
        </Box>
      </MenuItem>
    );
  }
}

SelectedMenuItem.propTypes = {
  name: PropTypes.string,
  children: PropTypes.node.isRequired,
  selectedIconName: PropTypes.object.isRequired,
  isSelected: PropTypes.bool.isRequired,
  onPress: PropTypes.func.isRequired
};

SelectedMenuItem.defaultProps = {
  selectedIconName: icons.CHECK
};

export default SelectedMenuItem;
