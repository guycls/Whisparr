import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Icon from 'Components/Icon';
import keyboardShortcuts, { shortcuts } from 'Components/keyboardShortcuts';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import { icons } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import FuseWorker from './fuse.worker';
import SeriesSearchResult from './SeriesSearchResult';

const ADD_NEW_TYPE = 'addNew';

class SeriesSearchInput extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this._input = null;
    this._worker = null;

    this.state = {
      value: '',
      suggestions: []
    };
  }

  componentDidMount() {
    this.props.bindShortcut(shortcuts.SERIES_SEARCH_INPUT.key, this.focusInput);
  }

  componentWillUnmount() {
    if (this._worker) {
      this._worker.removeEventListener('message', this.onSuggestionsReceived, false);
      this._worker.terminate();
      this._worker = null;
    }
  }

  getWorker() {
    if (!this._worker) {
      this._worker = new FuseWorker();
      this._worker.addEventListener('message', this.onSuggestionsReceived, false);
    }

    return this._worker;
  }

  //
  // Control

  setInputRef = (node) => {
    this._input = node;
  };

  focusInput = (event) => {
    event.preventDefault();

    if (this._input) {
      this._input.focus();
    }
  };

  renderSuggestion(item, { query }) {
    if (item.type === ADD_NEW_TYPE) {
      return (
        <Box sx={{ padding: '5px 3px', cursor: 'pointer' }}>
          {translate('SearchForQuery', { query })}
        </Box>
      );
    }

    return (
      <SeriesSearchResult
        {...item.item}
        match={item.matches[0]}
      />
    );
  }

  goToSeries(item) {
    this.setState({ value: '' });
    this.props.onGoToSeries(item.item.titleSlug);
  }

  reset() {
    this.setState({
      value: '',
      suggestions: [],
      loading: false
    });
  }

  //
  // Listeners

  onInputChange = (event, newValue, reason) => {
    if (reason === 'reset') {
      return;
    }

    this.setState({ value: newValue });

    if (reason !== 'input') {
      return;
    }

    if (newValue) {
      this.onSuggestionsFetchRequested({ value: newValue });
    } else {
      this.onSuggestionsClearRequested();
    }
  };

  onOptionChange = (event, option) => {
    if (!option || typeof option === 'string') {
      if (option) {
        this.props.onGoToAddNewSeries(option);
        this.reset();
      }

      return;
    }

    this.onSuggestionSelected(event, { suggestion: option });
    this.reset();
  };

  onKeyDown = (event) => {
    if (event.key === 'Escape') {
      this.reset();
    }
  };

  onBlur = () => {
    this.reset();
  };

  onSuggestionsFetchRequested = ({ value }) => {
    if (!this.state.loading) {
      this.setState({
        loading: true
      });
    }

    this.requestSuggestions(value);
  };

  requestSuggestions = _.debounce((value) => {
    if (!this.state.loading) {
      return;
    }

    const requestLoading = this.state.requestLoading;

    this.setState({
      requestValue: value,
      requestLoading: true
    });

    if (!requestLoading) {
      const payload = {
        value,
        series: this.props.series
      };

      this.getWorker().postMessage(payload);
    }
  }, 250);

  onSuggestionsReceived = (message) => {
    const {
      value,
      suggestions
    } = message.data;

    if (!this.state.loading) {
      this.setState({
        requestValue: null,
        requestLoading: false
      });
    } else if (value === this.state.requestValue) {
      this.setState({
        suggestions,
        requestValue: null,
        requestLoading: false,
        loading: false
      });
    } else {
      this.setState({
        suggestions,
        requestLoading: true
      });

      const payload = {
        value: this.state.requestValue,
        series: this.props.series
      };

      this.getWorker().postMessage(payload);
    }
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: [],
      loading: false
    });
  };

  onSuggestionSelected = (event, { suggestion }) => {
    if (suggestion.type === ADD_NEW_TYPE) {
      this.props.onGoToAddNewSeries(this.state.value);
    } else {
      this.goToSeries(suggestion);
    }
  };

  //
  // Render

  render() {
    const {
      value,
      loading,
      suggestions
    } = this.state;

    const options = [
      ...suggestions,
      {
        type: ADD_NEW_TYPE,
        title: value
      }
    ];

    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flex: '0 1 50%',
          minWidth: 160,
          maxWidth: '50%'
        }}
      >
        <Autocomplete
          freeSolo={true}
          fullWidth={true}
          size="small"
          options={value ? options : []}
          inputValue={value}
          filterOptions={(items) => items}
          getOptionLabel={(option) => {
            if (typeof option === 'string') {
              return option;
            }

            return option.title || '';
          }}
          onInputChange={this.onInputChange}
          onChange={this.onOptionChange}
          onBlur={this.onBlur}
          renderOption={(optionProps, option, state) => {
            const showExistingHeader = state.index === 0 && option.type !== ADD_NEW_TYPE;
            const showAddHeader = option.type === ADD_NEW_TYPE;

            return (
              <li {...optionProps} key={option.item ? option.item.titleSlug : ADD_NEW_TYPE}>
                {
                  showExistingHeader ?
                    <Box sx={{ color: 'text.secondary', fontSize: 12, mb: 0.5 }}>
                      {translate('ExistingSite')}
                      {loading ? <LoadingIndicator size={20} /> : null}
                    </Box> :
                    null
                }
                {
                  showAddHeader ?
                    <Box sx={{ color: 'text.secondary', fontSize: 12, mb: 0.5 }}>
                      {translate('AddNewSite')}
                    </Box> :
                    null
                }
                {this.renderSuggestion(option, { query: value })}
              </li>
            );
          }}
          renderInput={(params) => {
            return (
              <TextField
                {...params}
                inputRef={this.setInputRef}
                placeholder={translate('Search')}
                onKeyDown={this.onKeyDown}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 5,
                    backgroundColor: 'action.hover',
                    color: 'inherit'
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'transparent'
                  },
                  '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'divider'
                  },
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main'
                  },
                  '& .MuiInputBase-input': {
                    py: '6px'
                  }
                }}
                slotProps={{
                  ...params.slotProps,
                  input: {
                    ...params.slotProps?.input,
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <Icon name={icons.SEARCH} />
                      </InputAdornment>
                    )
                  }
                }}
              />
            );
          }}
        />
      </Box>
    );
  }
}

SeriesSearchInput.propTypes = {
  series: PropTypes.arrayOf(PropTypes.object).isRequired,
  onGoToSeries: PropTypes.func.isRequired,
  onGoToAddNewSeries: PropTypes.func.isRequired,
  bindShortcut: PropTypes.func.isRequired
};

export default keyboardShortcuts(SeriesSearchInput);
