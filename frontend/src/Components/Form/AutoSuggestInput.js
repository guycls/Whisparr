import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

class AutoSuggestInput extends Component {

  onInputChange = (event, newValue, reason) => {
    if (reason === 'reset') {
      return;
    }

    if (this.props.onInputChange) {
      this.props.onInputChange(event, { newValue, method: reason });
      return;
    }

    this.props.onChange({
      name: this.props.name,
      value: newValue
    });
  };

  onChange = (event, option) => {
    if (this.props.onSuggestionSelected && option) {
      const suggestionValue = this.props.getSuggestionValue(option);

      this.props.onSuggestionSelected(event, {
        suggestion: option,
        suggestionValue
      });
    }
  };

  onKeyDown = (event) => {
    if (this.props.onInputKeyDown) {
      this.props.onInputKeyDown(event);
      return;
    }

    const {
      name,
      value,
      suggestions,
      onChange
    } = this.props;

    if (
      event.key === 'Tab' &&
      suggestions.length &&
      this.props.getSuggestionValue(suggestions[0]) !== value
    ) {
      event.preventDefault();

      if (value) {
        onChange({
          name,
          value: this.props.getSuggestionValue(suggestions[0])
        });
      }
    }
  };

  render() {
    const {
      className,
      name,
      value,
      placeholder,
      suggestions,
      hasError,
      hasWarning,
      getSuggestionValue,
      renderSuggestion,
      onInputFocus,
      onInputBlur,
      onSuggestionsFetchRequested
    } = this.props;

    return (
      <Autocomplete
        freeSolo={true}
        fullWidth={true}
        size="small"
        options={suggestions}
        inputValue={value == null ? '' : String(value)}
        filterOptions={(options) => options}
        getOptionLabel={(option) => {
          if (option == null) {
            return '';
          }

          if (typeof option === 'string') {
            return option;
          }

          return String(getSuggestionValue(option) ?? '');
        }}
        onInputChange={(event, newValue, reason) => {
          this.onInputChange(event, newValue, reason);

          if (reason === 'input' && onSuggestionsFetchRequested) {
            onSuggestionsFetchRequested({ value: newValue });
          }
        }}
        onChange={this.onChange}
        onFocus={onInputFocus}
        onBlur={onInputBlur}
        renderOption={(optionProps, option) => {
          return (
            <li {...optionProps}>
              {renderSuggestion(option, { query: value })}
            </li>
          );
        }}
        renderInput={(params) => {
          return (
            <TextField
              {...params}
              className={className}
              name={name}
              placeholder={placeholder}
              error={!!hasError}
              color={hasWarning ? 'warning' : 'primary'}
              onKeyDown={this.onKeyDown}
            />
          );
        }}
      />
    );
  }
}

AutoSuggestInput.propTypes = {
  forwardedRef: PropTypes.func,
  className: PropTypes.string,
  inputContainerClassName: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  placeholder: PropTypes.string,
  suggestions: PropTypes.array.isRequired,
  hasError: PropTypes.bool,
  hasWarning: PropTypes.bool,
  enforceMaxHeight: PropTypes.bool,
  minHeight: PropTypes.number,
  maxHeight: PropTypes.number,
  getSuggestionValue: PropTypes.func.isRequired,
  renderInputComponent: PropTypes.elementType,
  renderSuggestion: PropTypes.func.isRequired,
  onInputChange: PropTypes.func,
  onInputKeyDown: PropTypes.func,
  onInputFocus: PropTypes.func,
  onInputBlur: PropTypes.func,
  onSuggestionsFetchRequested: PropTypes.func.isRequired,
  onSuggestionsClearRequested: PropTypes.func,
  onSuggestionSelected: PropTypes.func,
  onChange: PropTypes.func.isRequired
};

AutoSuggestInput.defaultProps = {
  suggestions: [],
  enforceMaxHeight: true,
  minHeight: 50,
  maxHeight: 200
};

export default AutoSuggestInput;
