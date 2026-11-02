import GlobalStyles from '@mui/material/GlobalStyles';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Autosuggest from 'react-autosuggest';
import { Manager, Popper, Reference } from 'react-popper';
import Portal from 'Components/Portal';

const containerClass = 'WhisparrAutoSuggest-container';
const inputClass = 'WhisparrAutoSuggest-input';
const errorClass = 'WhisparrAutoSuggest-error';
const warningClass = 'WhisparrAutoSuggest-warning';
const suggestionsClass = 'WhisparrAutoSuggest-suggestions';
const listClass = 'WhisparrAutoSuggest-list';
const suggestionClass = 'WhisparrAutoSuggest-suggestion';
const highlightedClass = 'WhisparrAutoSuggest-highlighted';

class AutoSuggestInput extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this._scheduleUpdate = null;
  }

  componentDidUpdate(prevProps) {
    if (
      this._scheduleUpdate &&
      prevProps.suggestions !== this.props.suggestions
    ) {
      this._scheduleUpdate();
    }
  }

  //
  // Control

  renderInputComponent = (inputProps) => {
    const { renderInputComponent } = this.props;

    return (
      <Reference>
        {({ ref }) => {
          if (renderInputComponent) {
            return renderInputComponent(inputProps, ref);
          }

          return (
            <div ref={ref}>
              <input
                {...inputProps}
              />
            </div>
          );
        }}
      </Reference>
    );
  };

  renderSuggestionsContainer = ({ containerProps, children }) => {
    return (
      <Portal>
        <Popper
          placement='bottom-start'
          modifiers={{
            computeMaxHeight: {
              order: 851,
              enabled: true,
              fn: this.onComputeMaxHeight
            },
            flip: {
              padding: this.props.minHeight
            }
          }}
        >
          {({ ref: popperRef, style, scheduleUpdate }) => {
            this._scheduleUpdate = scheduleUpdate;

            return (
              <div
                ref={popperRef}
                style={{
                  ...style,
                  zIndex: 2000
                }}
              >
                <div
                  {...containerProps}
                  style={{
                    maxHeight: style.maxHeight
                  }}
                >
                  {children}
                </div>
              </div>
            );
          }}
        </Popper>
      </Portal>
    );
  };

  //
  // Listeners

  onComputeMaxHeight = (data) => {
    const {
      top,
      bottom,
      width
    } = data.offsets.reference;

    const windowHeight = window.innerHeight;

    if ((/^botton/).test(data.placement)) {
      data.styles.maxHeight = windowHeight - bottom;
    } else {
      data.styles.maxHeight = top;
    }

    data.styles.width = width;

    return data;
  };

  onInputChange = (event, { newValue }) => {
    this.props.onChange({
      name: this.props.name,
      value: newValue
    });
  };

  onInputKeyDown = (event) => {
    const {
      name,
      value,
      suggestions,
      onChange
    } = this.props;

    if (
      event.key === 'Tab' &&
      suggestions.length &&
      suggestions[0] !== this.props.value
    ) {
      event.preventDefault();

      if (value) {
        onChange({
          name,
          value: suggestions[0]
        });
      }
    }
  };

  //
  // Render

  render() {
    const {
      forwardedRef,
      className,
      inputContainerClassName,
      name,
      value,
      placeholder,
      suggestions,
      hasError,
      hasWarning,
      getSuggestionValue,
      renderSuggestion,
      onInputChange,
      onInputKeyDown,
      onInputFocus,
      onInputBlur,
      onSuggestionsFetchRequested,
      onSuggestionsClearRequested,
      onSuggestionSelected,
      ...otherProps
    } = this.props;

    const inputProps = {
      className: classNames(
        className,
        hasError && errorClass,
        hasWarning && warningClass
      ),
      name,
      value,
      placeholder,
      autoComplete: 'off',
      spellCheck: false,
      onChange: onInputChange || this.onInputChange,
      onKeyDown: onInputKeyDown || this.onInputKeyDown,
      onFocus: onInputFocus,
      onBlur: onInputBlur
    };

    const theme = {
      container: inputContainerClassName,
      suggestionsContainer: suggestionsClass,
      suggestionsList: listClass,
      suggestion: suggestionClass,
      suggestionHighlighted: highlightedClass
    };

    return (
      <Manager>
        <GlobalStyles
          styles={{
            [`.${containerClass}`]: {
              flexGrow: 1
            },
            [`.${inputClass}`]: {
              padding: '6px 16px',
              width: '100%',
              height: 35,
              border: '1px solid var(--inputBorderColor)',
              borderRadius: '4px',
              backgroundColor: 'var(--inputBackgroundColor)',
              boxShadow: 'inset 0 1px 1px var(--inputBoxShadowColor)',
              color: 'var(--textColor)'
            },
            [`.${errorClass}`]: {
              borderColor: 'var(--inputErrorBorderColor)'
            },
            [`.${warningClass}`]: {
              borderColor: 'var(--inputWarningBorderColor)'
            },
            [`.${suggestionsClass}`]: {
              overflowY: 'auto',
              maxHeight: 200,
              width: '100%',
              border: '1px solid var(--inputBorderColor)',
              borderRadius: '4px',
              backgroundColor: 'var(--inputBackgroundColor)',
              boxShadow: 'inset 0 1px 1px var(--inputBoxShadowColor)',
              scrollbarColor: 'var(--scrollbarBackgroundColor) transparent',
              scrollbarWidth: 'thin'
            },
            [`.${listClass}`]: {
              margin: '5px 0',
              paddingLeft: 0,
              maxHeight: 200,
              listStyleType: 'none'
            },
            [`.${suggestionClass}`]: {
              padding: '0 16px'
            },
            [`.${highlightedClass}`]: {
              backgroundColor: 'var(--menuItemHoverBackgroundColor)'
            }
          }}
        />
        <Autosuggest
          {...otherProps}
          ref={forwardedRef}
          id={name}
          inputProps={inputProps}
          theme={theme}
          suggestions={suggestions}
          getSuggestionValue={getSuggestionValue}
          renderInputComponent={this.renderInputComponent}
          renderSuggestionsContainer={this.renderSuggestionsContainer}
          renderSuggestion={renderSuggestion}
          onSuggestionSelected={onSuggestionSelected}
          onSuggestionsFetchRequested={onSuggestionsFetchRequested}
          onSuggestionsClearRequested={onSuggestionsClearRequested}
        />
      </Manager>
    );
  }
}

AutoSuggestInput.propTypes = {
  forwardedRef: PropTypes.func,
  className: PropTypes.string.isRequired,
  inputContainerClassName: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  placeholder: PropTypes.string,
  suggestions: PropTypes.array.isRequired,
  hasError: PropTypes.bool,
  hasWarning: PropTypes.bool,
  enforceMaxHeight: PropTypes.bool.isRequired,
  minHeight: PropTypes.number.isRequired,
  maxHeight: PropTypes.number.isRequired,
  getSuggestionValue: PropTypes.func.isRequired,
  renderInputComponent: PropTypes.elementType,
  renderSuggestion: PropTypes.func.isRequired,
  onInputChange: PropTypes.func,
  onInputKeyDown: PropTypes.func,
  onInputFocus: PropTypes.func,
  onInputBlur: PropTypes.func.isRequired,
  onSuggestionsFetchRequested: PropTypes.func.isRequired,
  onSuggestionsClearRequested: PropTypes.func.isRequired,
  onSuggestionSelected: PropTypes.func,
  onChange: PropTypes.func.isRequired
};

AutoSuggestInput.defaultProps = {
  className: inputClass,
  inputContainerClassName: containerClass,
  enforceMaxHeight: true,
  minHeight: 50,
  maxHeight: 200
};

export default AutoSuggestInput;
