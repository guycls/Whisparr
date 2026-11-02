import Button from '@mui/material/Button';
import PropTypes from 'prop-types';
import React from 'react';

function MenuButton(props) {
  const {
    className,
    children,
    isDisabled,
    onPress,
    ...otherProps
  } = props;

  return (
    <Button
      className={className}
      color="inherit"
      disabled={isDisabled}
      onClick={onPress}
      {...otherProps}
    >
      {children}
    </Button>
  );
}

MenuButton.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  isDisabled: PropTypes.bool.isRequired,
  onPress: PropTypes.func
};

MenuButton.defaultProps = {
  isDisabled: false
};

export default MenuButton;
