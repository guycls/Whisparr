import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'Components/Icon';
import Menu from 'Components/Menu/Menu';
import MenuButton from 'Components/Menu/MenuButton';
import MenuContent from 'Components/Menu/MenuContent';
import SelectedMenuItem from 'Components/Menu/SelectedMenuItem';
import { align, icons } from 'Helpers/Props';
import { saveUISettings } from 'Store/Actions/Settings/ui';
import titleCase from 'Utilities/String/titleCase';
import translate from 'Utilities/String/translate';

const themeNames = ['auto', 'light', 'dark'];

function ThemeMenu() {
  const dispatch = useDispatch();
  const currentTheme = useSelector(
    (state) => state.settings.ui.item.theme || 'auto'
  );
  const isPopulated = useSelector((state) => state.settings.ui.isPopulated);

  const onSelect = useCallback((theme) => {
    if (!isPopulated) {
      return;
    }

    dispatch(saveUISettings({ theme }));
  }, [dispatch, isPopulated]);

  return (
    <Menu alignMenu={align.RIGHT}>
      <MenuButton
        aria-label={translate('Theme')}
        title={translate('Theme')}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 40,
          width: 40,
          height: 40,
          p: 0,
          lineHeight: 0,
          borderRadius: '50%',
          color: 'inherit'
        }}
      >
        <Icon
          name={icons.THEME}
          size={18}
        />
      </MenuButton>

      <MenuContent>
        {
          themeNames.map((themeName) => {
            return (
              <SelectedMenuItem
                key={themeName}
                name={themeName}
                isSelected={currentTheme === themeName}
                selected={currentTheme === themeName}
                onPress={onSelect}
              >
                {titleCase(themeName)}
              </SelectedMenuItem>
            );
          })
        }
      </MenuContent>
    </Menu>
  );
}

export default ThemeMenu;
