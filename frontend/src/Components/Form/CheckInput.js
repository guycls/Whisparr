import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { kinds } from 'Helpers/Props';
import { kindToColor } from 'Helpers/Props/muiKind';

class CheckInput extends Component {

  //
  // Listeners

  onChange = (event) => {
    if (this.props.isDisabled) {
      return;
    }

    const {
      name,
      checkedValue,
      uncheckedValue
    } = this.props;

    this.props.onChange({
      name,
      value: event.target.checked ? checkedValue : uncheckedValue,
      shiftKey: event.nativeEvent.shiftKey
    });
  };

  //
  // Render

  render() {
    const {
      name,
      value,
      checkedValue,
      uncheckedValue,
      helpText,
      helpTextWarning,
      isDisabled,
      kind
    } = this.props;

    const isChecked = value === checkedValue;
    const isUnchecked = value === uncheckedValue;
    const isIndeterminate = !isChecked && !isUnchecked;

    return (
      <div>
        <FormControlLabel
          control={
            <Checkbox
              name={name}
              checked={isChecked}
              indeterminate={isIndeterminate}
              disabled={isDisabled}
              color={kindToColor(kind) === 'inherit' ? 'primary' : kindToColor(kind)}
              onChange={this.onChange}
            />
          }
          label={helpText || helpTextWarning || ''}
        />
        {
          helpTextWarning && !helpText &&
            <FormHelperText>
              {helpTextWarning}
            </FormHelperText>
        }
      </div>
    );
  }
}

CheckInput.propTypes = {
  className: PropTypes.string,
  containerClassName: PropTypes.string,
  name: PropTypes.string.isRequired,
  checkedValue: PropTypes.bool,
  uncheckedValue: PropTypes.bool,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  helpText: PropTypes.string,
  helpTextWarning: PropTypes.string,
  isDisabled: PropTypes.bool,
  kind: PropTypes.oneOf(kinds.all).isRequired,
  onChange: PropTypes.func.isRequired
};

CheckInput.defaultProps = {
  checkedValue: true,
  uncheckedValue: false,
  kind: kinds.PRIMARY
};

export default CheckInput;
