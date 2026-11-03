import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import jdu from 'jdu';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

class AutoCompleteInput extends Component {

  onInputChange = (event, newValue, reason) => {
    if (reason === 'reset') {
      return;
    }

    this.props.onChange({
      name: this.props.name,
      value: newValue
    });
  };

  render() {
    const {
      name,
      value,
      values,
      hasError,
      hasWarning,
      placeholder
    } = this.props;

    return (
      <Autocomplete
        freeSolo={true}
        fullWidth={true}
        size="small"
        options={values || []}
        inputValue={value == null ? '' : String(value)}
        getOptionLabel={(option) => String(option)}
        filterOptions={(options, state) => {
          const query = jdu.replace(state.inputValue || '').toLowerCase();

          if (!query) {
            return options;
          }

          return options.filter((option) => {
            return jdu.replace(option).toLowerCase().includes(query);
          });
        }}
        onInputChange={this.onInputChange}
        onChange={(event, option) => {
          if (option == null) {
            return;
          }

          this.props.onChange({
            name,
            value: option
          });
        }}
        renderInput={(params) => {
          return (
            <TextField
              {...params}
              name={name}
              placeholder={placeholder}
              error={!!hasError}
              color={hasWarning ? 'warning' : 'primary'}
            />
          );
        }}
      />
    );
  }
}

AutoCompleteInput.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
  values: PropTypes.arrayOf(PropTypes.string).isRequired,
  hasError: PropTypes.bool,
  hasWarning: PropTypes.bool,
  placeholder: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func
};

export default AutoCompleteInput;
