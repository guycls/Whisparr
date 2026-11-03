import Box from '@mui/material/Box';
import ToggleButton from '@mui/material/ToggleButton';
import PropTypes from 'prop-types';
import React from 'react';
import Icon from 'Components/Icon';
import { toolbarButtonSx, TOOLBAR_ICON_SIZE } from 'Components/Page/Toolbar/ToolbarIconSlot';
import Tooltip from 'Components/Tooltip/Tooltip';
import { icons, tooltipPositions } from 'Helpers/Props';
import translate from 'Utilities/String/translate';

function AdvancedSettingsButton(props) {
  const {
    advancedSettings,
    onAdvancedSettingsPress
  } = props;

  const label = advancedSettings ? translate('HideAdvanced') : translate('ShowAdvanced');

  return (
    <Tooltip
      position={tooltipPositions.BOTTOM}
      tooltip={advancedSettings ? translate('ShownClickToHide') : translate('HiddenClickToShow')}
      anchor={
        <ToggleButton
          aria-label={label}
          value="advanced"
          selected={advancedSettings}
          onChange={onAdvancedSettingsPress}
          sx={{
            ...toolbarButtonSx,
            position: 'relative',
            overflow: 'visible'
          }}
        >
          <Icon
            name={icons.ADVANCED_SETTINGS}
            size={TOOLBAR_ICON_SIZE}
          />

          <Box
            component="span"
            sx={{
              position: 'absolute',
              top: 2,
              right: 2
            }}
          >
            <Box
              component="span"
              sx={{ color: 'text.secondary' }}
            >
              <Icon
                name={icons.CIRCLE}
                size={16}
              />
            </Box>

            <Box
              component="span"
              sx={{ color: advancedSettings ? 'success.main' : 'error.main' }}
            >
              <Icon
                name={advancedSettings ? icons.CHECK : icons.CLOSE}
                size={10}
              />
            </Box>
          </Box>
        </ToggleButton>
      }
    />
  );
}

AdvancedSettingsButton.propTypes = {
  advancedSettings: PropTypes.bool.isRequired,
  onAdvancedSettingsPress: PropTypes.func.isRequired,
  showLabel: PropTypes.bool
};

AdvancedSettingsButton.defaultProps = {
  showLabel: false
};

export default AdvancedSettingsButton;
