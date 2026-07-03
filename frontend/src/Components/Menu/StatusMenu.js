import PropTypes from 'prop-types';
import React from 'react';
import Menu from 'Components/Menu/Menu';
import ToolbarMenuButton from 'Components/Menu/ToolbarMenuButton';
import { align, icons } from 'Helpers/Props';
import translate from 'Utilities/String/translate';

function StatusMenu(props) {
  const {
    children,
    isDisabled,
    showIndicator,
    ...otherProps
  } = props;

  return (
    <Menu
      {...otherProps}
    >
      <ToolbarMenuButton
        iconName={icons.MONITORED}
        text={translate('Status')}
        showIndicator={showIndicator}
        isDisabled={isDisabled}
      />
      {children}
    </Menu>
  );
}

StatusMenu.propTypes = {
  children: PropTypes.node.isRequired,
  isDisabled: PropTypes.bool.isRequired,
  showIndicator: PropTypes.bool.isRequired,
  alignMenu: PropTypes.oneOf([align.LEFT, align.RIGHT])
};

StatusMenu.defaultProps = {
  isDisabled: false,
  showIndicator: false
};

export default StatusMenu;
