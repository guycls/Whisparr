import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import Icon from 'Components/Icon';
import { icons } from 'Helpers/Props';
import FormInputButton from './FormInputButton';
import TextInput from './TextInput';

function CaptchaInput(props) {
  const {
    name,
    value,
    refreshing,
    siteKey,
    secretToken,
    onChange,
    onRefreshPress,
    onCaptchaChange
  } = props;

  return (
    <div>
      <Box sx={{ display: 'flex' }}>
        <TextInput
          name={name}
          value={value}
          onChange={onChange}
        />

        <FormInputButton
          onPress={onRefreshPress}
        >
          <Icon
            name={icons.REFRESH}
            isSpinning={refreshing}
          />
        </FormInputButton>
      </Box>

      {
        !!siteKey && !!secretToken &&
          <Box sx={{ mt: '10px' }}>
            <ReCAPTCHA
              sitekey={siteKey}
              stoken={secretToken}
              onChange={onCaptchaChange}
            />
          </Box>
      }
    </div>
  );
}

CaptchaInput.propTypes = {
  className: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  hasError: PropTypes.bool,
  hasWarning: PropTypes.bool,
  refreshing: PropTypes.bool.isRequired,
  siteKey: PropTypes.string,
  secretToken: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onRefreshPress: PropTypes.func.isRequired,
  onCaptchaChange: PropTypes.func.isRequired
};

CaptchaInput.defaultProps = {
  value: ''
};

export default CaptchaInput;
