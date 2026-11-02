import PropTypes from 'prop-types';
import React from 'react';

function MenuContent(props) {
  return props.children;
}

MenuContent.displayName = 'MenuContent';

MenuContent.propTypes = {
  forwardedRef: PropTypes.func,
  className: PropTypes.string,
  id: PropTypes.string,
  children: PropTypes.node.isRequired,
  style: PropTypes.object,
  isOpen: PropTypes.bool
};

export default MenuContent;
