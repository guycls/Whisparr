import Box from '@mui/material/Box';
import ToggleButton from '@mui/material/ToggleButton';
import PropTypes from 'prop-types';
import React from 'react';
import Icon from 'Components/Icon';
import { icons } from 'Helpers/Props';
import translate from 'Utilities/String/translate';

function AdvancedSettingsButton(props) {
  const {
    advancedSettings,
    onAdvancedSettingsPress,
    showLabel
  } = props;

  return (
    <Box
      sx={(theme) => ({
        position: 'relative',
        display: 'inline-flex',
        justifyContent: 'center',
        width: 84,
        minWidth: 84,
        pt: theme.spacing(0.5),
        overflow: 'hidden',
        textAlign: 'center'
      })}
    >
      <ToggleButton
        value="advanced"
        selected={advancedSettings}
        title={advancedSettings ? translate('ShownClickToHide') : translate('HiddenClickToShow')}
        onChange={onAdvancedSettingsPress}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          minWidth: 0,
          p: 0,
          lineHeight: 1,
          color: 'inherit',
          border: 0,
          borderRadius: 0
        }}
      >
        <Icon
          name={icons.ADVANCED_SETTINGS}
          size={21}
        />

        <Box
          component="span"
          className="fa-layers fa-fw"
          sx={{
            position: 'absolute',
            top: '10px',
            right: '12px'
          }}
        >
          <Box
            component="span"
            sx={(theme) => ({ color: theme.palette.text.secondary })}
          >
            <Icon
              name={icons.CIRCLE}
              size={16}
            />
          </Box>

          <Box
            component="span"
            sx={(theme) => ({
              color: advancedSettings ? theme.palette.success.main : theme.palette.error.main
            })}
          >
            <Icon
              name={advancedSettings ? icons.CHECK : icons.CLOSE}
              size={10}
            />
          </Box>
        </Box>

        {
          showLabel ?
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: 24
              }}
            >
              <Box
                sx={(theme) => ({
                  width: '100%',
                  px: '3px',
                  overflow: 'hidden',
                  color: theme.palette.text.secondary,
                  fontSize: 11,
                  lineHeight: '12px',
                  textAlign: 'center',
                  whiteSpace: 'normal'
                })}
              >
                {advancedSettings ? translate('HideAdvanced') : translate('ShowAdvanced')}
              </Box>
            </Box> :
            null
        }
      </ToggleButton>
    </Box>
  );
}

AdvancedSettingsButton.propTypes = {
  advancedSettings: PropTypes.bool.isRequired,
  onAdvancedSettingsPress: PropTypes.func.isRequired,
  showLabel: PropTypes.bool.isRequired
};

AdvancedSettingsButton.defaultProps = {
  showLabel: true
};

export default AdvancedSettingsButton;
