import PropTypes from 'prop-types';
import React from 'react';
import Icon from 'Components/Icon';
import Menu from 'Components/Menu/Menu';
import MenuButton from 'Components/Menu/MenuButton';
import MenuContent from 'Components/Menu/MenuContent';
import MenuItem from 'Components/Menu/MenuItem';
import MenuItemSeparator from 'Components/Menu/MenuItemSeparator';
import { align, icons, kinds } from 'Helpers/Props';
import translate from 'Utilities/String/translate';

function PageHeaderActionsMenu(props) {
  const {
    formsAuth,
    onKeyboardShortcutsPress,
    onRestartPress,
    onShutdownPress
  } = props;

  return (
    <div>
      <Menu alignMenu={align.RIGHT}>
        <MenuButton
          aria-label="Menu Button"
          sx={{
            minWidth: 40,
            width: 40,
            height: 40,
            p: 0,
            borderRadius: '50%',
            color: 'inherit'
          }}
        >
          <Icon
            name={icons.INTERACTIVE}
            size={18}
            title={translate('Menu')}
          />
        </MenuButton>

        <MenuContent>
          <MenuItem onPress={onKeyboardShortcutsPress}>
            <Icon
              name={icons.KEYBOARD}
            />
            {translate('KeyboardShortcuts')}
          </MenuItem>

          <MenuItemSeparator />

          <MenuItem onPress={onRestartPress}>
            <Icon
              name={icons.RESTART}
            />
            {translate('Restart')}
          </MenuItem>

          <MenuItem onPress={onShutdownPress}>
            <Icon
              name={icons.SHUTDOWN}
              kind={kinds.DANGER}
            />
            {translate('Shutdown')}
          </MenuItem>

          {
            formsAuth &&
              <MenuItemSeparator />
          }

          {
            formsAuth &&
              <MenuItem
                to={`${window.Whisparr.urlBase}/logout`}
                noRouter={true}
              >
                <Icon
                  name={icons.LOGOUT}
                />
                {translate('Logout')}
              </MenuItem>
          }
        </MenuContent>
      </Menu>
    </div>
  );
}

PageHeaderActionsMenu.propTypes = {
  formsAuth: PropTypes.bool.isRequired,
  onKeyboardShortcutsPress: PropTypes.func.isRequired,
  onRestartPress: PropTypes.func.isRequired,
  onShutdownPress: PropTypes.func.isRequired
};

export default PageHeaderActionsMenu;
