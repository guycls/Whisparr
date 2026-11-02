import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Link from 'Components/Link/Link';

class PageJumpBarItem extends Component {

  //
  // Listeners

  onPress = () => {
    const {
      label,
      onItemPress
    } = this.props;

    onItemPress(label);
  };

  //
  // Render

  render() {
    return (
      <Link
        sx={{
          flex: '1 1 25px',
          borderBottom: '1px solid var(--borderColor)',
          textAlign: 'center',
          fontWeight: 'bold',
          '&:hover': {
            color: '#777'
          },
          '&:last-child': {
            border: 'none'
          }
        }}
        onPress={this.onPress}
      >
        {this.props.label.toUpperCase()}
      </Link>
    );
  }
}

PageJumpBarItem.propTypes = {
  label: PropTypes.string.isRequired,
  onItemPress: PropTypes.func.isRequired
};

export default PageJumpBarItem;
