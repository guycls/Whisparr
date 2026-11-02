import MenuItem from '@mui/material/MenuItem';
import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { withUrlBase } from 'Components/Link/Link';
import { MenuCloseContext } from './Menu';

const externalUrlRegex = /\w+?:\/\//;

function AppMenuItem(props) {
  const {
    className,
    children,
    isDisabled,
    onPress,
    to,
    target,
    noRouter,
    ...otherProps
  } = props;

  const close = useContext(MenuCloseContext);

  const onClick = (event) => {
    if (isDisabled) {
      event.preventDefault();

      return;
    }

    if (onPress) {
      onPress(event);
    }

    close();
  };

  const linkProps = {};

  if (to && (externalUrlRegex.test(to) || noRouter)) {
    linkProps.component = 'a';
    linkProps.href = to;
    linkProps.target = target || (externalUrlRegex.test(to) ? '_blank' : undefined);
    linkProps.rel = externalUrlRegex.test(to) ? 'noreferrer' : undefined;
  } else if (to) {
    linkProps.component = RouterLink;
    linkProps.to = withUrlBase(to);
  }

  return (
    <MenuItem
      className={className}
      disabled={isDisabled}
      onClick={onClick}
      {...linkProps}
      {...otherProps}
    >
      {children}
    </MenuItem>
  );
}

AppMenuItem.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  isDisabled: PropTypes.bool.isRequired,
  onPress: PropTypes.func,
  to: PropTypes.string,
  target: PropTypes.string,
  noRouter: PropTypes.bool
};

AppMenuItem.defaultProps = {
  isDisabled: false
};

export default AppMenuItem;
