import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import HintedSelectInputOption from './HintedSelectInputOption';
import HintedSelectInputSelectedValue from './HintedSelectInputSelectedValue';

function optionLabel(option) {
  if (option == null) {
    return '';
  }

  if (typeof option === 'string' || typeof option === 'number') {
    return String(option);
  }

  const label = option.value;

  if (typeof label === 'function') {
    return label();
  }

  if (label == null) {
    return String(option.key ?? '');
  }

  return String(label);
}

class EnhancedSelectInput extends Component {

  onOpen = () => {
    if (this.props.onOpen) {
      this.props.onOpen();
    }
  };

  onChange = (event, nextValue) => {
    const {
      name,
      value,
      onChange
    } = this.props;

    if (Array.isArray(value)) {
      onChange({
        name,
        value: (nextValue || []).map((option) => {
          return option && option.key !== undefined ? option.key : option;
        })
      });

      return;
    }

    if (nextValue && typeof nextValue === 'object') {
      onChange({
        name,
        value: nextValue.key
      });

      return;
    }

    onChange({
      name,
      value: nextValue
    });
  };

  getSelected(options, value, isEditable) {
    if (Array.isArray(value)) {
      return value.map((key) => {
        return options.find((option) => option.key === key) || { key, value: key };
      });
    }

    const match = options.find((option) => option.key === value);

    if (match) {
      return match;
    }

    if (isEditable && value !== '' && value != null) {
      return value;
    }

    return null;
  }

  render() {
    const {
      className,
      name,
      value,
      values,
      isDisabled,
      isEditable,
      isFetching,
      hasError,
      hasWarning,
      valueOptions,
      optionComponent: OptionComponent
    } = this.props;

    const options = values || [];
    const isMultiSelect = Array.isArray(value);
    const selected = this.getSelected(options, value, isEditable);

    return (
      <Autocomplete
        className={className}
        multiple={isMultiSelect}
        freeSolo={isEditable}
        disableCloseOnSelect={isMultiSelect}
        options={options}
        value={selected}
        disabled={isDisabled}
        loading={isFetching}
        size="small"
        fullWidth={true}
        getOptionLabel={optionLabel}
        isOptionEqualToValue={(option, selectedOption) => {
          if (!option || !selectedOption || typeof selectedOption !== 'object') {
            return option === selectedOption;
          }

          return option.key === selectedOption.key;
        }}
        getOptionDisabled={(option) => {
          const parentSelected = option.parentKey !== undefined &&
            isMultiSelect &&
            value.includes(option.parentKey);

          return !!option.isDisabled || parentSelected;
        }}
        onOpen={this.onOpen}
        onChange={this.onChange}
        onInputChange={(event, newValue, reason) => {
          if (isEditable && reason === 'input') {
            this.props.onChange({
              name,
              value: newValue
            });
          }
        }}
        renderOption={(optionProps, option, state) => {
          const parentSelected = option.parentKey !== undefined &&
            isMultiSelect &&
            value.includes(option.parentKey);

          return (
            <li {...optionProps} key={option.key}>
              <div style={{ pointerEvents: 'none', width: '100%' }}>
                <OptionComponent
                  {...valueOptions}
                  {...option}
                  id={option.key}
                  depth={option.parentKey !== undefined ? 1 : 0}
                  isSelected={state.selected}
                  isDisabled={!!option.isDisabled || parentSelected}
                  isMultiSelect={isMultiSelect}
                  isMobile={false}
                  onSelect={() => {}}
                >
                  {typeof option.value === 'function' ? option.value() : option.value}
                </OptionComponent>
              </div>
            </li>
          );
        }}
        renderInput={(params) => {
          return (
            <TextField
              {...params}
              name={name}
              error={!!hasError}
              color={hasWarning ? 'warning' : 'primary'}
            />
          );
        }}
      />
    );
  }
}

EnhancedSelectInput.propTypes = {
  className: PropTypes.string,
  disabledClassName: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.arrayOf(PropTypes.string), PropTypes.arrayOf(PropTypes.number)]).isRequired,
  values: PropTypes.arrayOf(PropTypes.object).isRequired,
  isDisabled: PropTypes.bool.isRequired,
  isFetching: PropTypes.bool.isRequired,
  isEditable: PropTypes.bool.isRequired,
  hasError: PropTypes.bool,
  hasWarning: PropTypes.bool,
  valueOptions: PropTypes.object.isRequired,
  selectedValueOptions: PropTypes.object.isRequired,
  selectedValueComponent: PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.elementType]).isRequired,
  optionComponent: PropTypes.elementType,
  onOpen: PropTypes.func,
  onChange: PropTypes.func.isRequired
};

EnhancedSelectInput.defaultProps = {
  isDisabled: false,
  isFetching: false,
  isEditable: false,
  valueOptions: {},
  selectedValueOptions: {},
  selectedValueComponent: HintedSelectInputSelectedValue,
  optionComponent: HintedSelectInputOption
};

export default EnhancedSelectInput;
