import FormHelperText from '@mui/material/FormHelperText';
import PropTypes from 'prop-types';
import React from 'react';
import Icon from 'Components/Icon';
import Link from 'Components/Link/Link';
import { icons } from 'Helpers/Props';

function FormInputHelpText(props) {
  const {
    text,
    link,
    tooltip,
    isError,
    isWarning
  } = props;

  return (
    <FormHelperText error={isError || isWarning}>
      {text}
      {
        link ?
          <Link
            to={link}
            title={tooltip}
          >
            <Icon
              name={icons.EXTERNAL_LINK}
            />
          </Link> :
          null
      }
      {
        !link && tooltip ?
          <Icon
            name={icons.INFO}
            title={tooltip}
          /> :
          null
      }
    </FormHelperText>
  );
}

FormInputHelpText.propTypes = {
  className: PropTypes.string,
  text: PropTypes.string.isRequired,
  link: PropTypes.string,
  tooltip: PropTypes.string,
  isError: PropTypes.bool,
  isWarning: PropTypes.bool,
  isCheckInput: PropTypes.bool
};

FormInputHelpText.defaultProps = {
  isError: false,
  isWarning: false,
  isCheckInput: false
};

export default FormInputHelpText;
