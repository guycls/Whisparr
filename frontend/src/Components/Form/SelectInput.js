import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

class SelectInput extends Component {

  //
  // Listeners

  onChange = (event) => {
    this.props.onChange({
      name: this.props.name,
      value: event.target.value
    });
  };

  //
  // Render

  render() {
    const {
      name,
      value,
      values,
      isDisabled,
      hasError,
      hasWarning,
      autoFocus,
      onBlur
    } = this.props;

    return (
      <FormControl
        fullWidth={true}
        size="small"
        disabled={isDisabled}
        error={!!hasError}
        color={hasWarning ? 'warning' : 'primary'}
      >
        <Select
          name={name}
          value={value}
          autoFocus={autoFocus}
          onChange={this.onChange}
          onBlur={onBlur}
        >
          {
            values.map((option) => {
              const {
                key,
                value: optionValue
              } = option;

              return (
                <MenuItem
                  key={key}
                  value={key}
                >
                  {typeof optionValue === 'function' ? optionValue() : optionValue}
                </MenuItem>
              );
            })
          }
        </Select>
      </FormControl>
    );
  }
}

SelectInput.propTypes = {
  className: PropTypes.string,
  disabledClassName: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.func]).isRequired,
  values: PropTypes.arrayOf(PropTypes.object).isRequired,
  isDisabled: PropTypes.bool,
  hasError: PropTypes.bool,
  hasWarning: PropTypes.bool,
  autoFocus: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func
};

SelectInput.defaultProps = {
  isDisabled: false,
  autoFocus: false
};

export default SelectInput;
