import Box from '@mui/material/Box';
import GlobalStyles from '@mui/material/GlobalStyles';
import TextField from '@mui/material/TextField';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Autosuggest from 'react-autosuggest';
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

    this._autosuggest = null;
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

  setAutosuggestRef = (ref) => {
    this._autosuggest = ref;
  };

  focusInput = (event) => {
    event.preventDefault();
    this._autosuggest.input.focus();
  };

  getSectionSuggestions(section) {
    return section.suggestions;
  }

  renderSectionTitle(section) {
    return (
      <div className="seriesSearchSectionTitle">
        {section.title}

        {
          section.loading &&
            <LoadingIndicator
              size={20}
            />
        }
      </div>
    );
  }

  getSuggestionValue({ title }) {
    return title;
  }

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

  onChange = (event, { newValue, method }) => {
    if (method === 'up' || method === 'down') {
      return;
    }

    this.setState({ value: newValue });
  };

  onKeyDown = (event) => {
    if (event.shiftKey || event.altKey || event.ctrlKey) {
      return;
    }

    if (event.key === 'Escape') {
      this.reset();
      return;
    }

    if (event.key !== 'Tab' && event.key !== 'Enter') {
      return;
    }

    const {
      suggestions,
      value
    } = this.state;

    const {
      highlightedSectionIndex,
      highlightedSuggestionIndex
    } = this._autosuggest.state;

    if (!suggestions.length || highlightedSectionIndex) {
      this.props.onGoToAddNewSeries(value);
      this._autosuggest.input.blur();
      this.reset();

      return;
    }

    // If an suggestion is not selected go to the first series,
    // otherwise go to the selected series.

    if (highlightedSuggestionIndex == null) {
      this.goToSeries(suggestions[0]);
    } else {
      this.goToSeries(suggestions[highlightedSuggestionIndex]);
    }

    this._autosuggest.input.blur();
    this.reset();
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

    const suggestionGroups = [];

    if (suggestions.length || loading) {
      suggestionGroups.push({
        title: translate('ExistingSite'),
        loading,
        suggestions
      });
    }

    suggestionGroups.push({
      title: translate('AddNewSite'),
      suggestions: [
        {
          type: ADD_NEW_TYPE,
          title: value
        }
      ]
    });

    const inputProps = {
      ref: this.setInputRef,
      name: 'seriesSearch',
      value,
      placeholder: translate('Search'),
      autoComplete: 'off',
      spellCheck: false,
      onChange: this.onChange,
      onKeyDown: this.onKeyDown,
      onBlur: this.onBlur,
      onFocus: this.onFocus
    };

    const theme = {
      container: 'seriesSearchContainer',
      containerOpen: 'seriesSearchContainerOpen',
      suggestionsContainer: 'seriesSearchSuggestions',
      suggestionsList: 'seriesSearchList',
      suggestion: 'seriesSearchItem',
      suggestionHighlighted: 'seriesSearchItemHighlighted'
    };

    return (
      <div className="seriesSearchWrapper">
        <GlobalStyles
          styles={(muiTheme) => ({
            '.seriesSearchWrapper': {
              display: 'flex',
              alignItems: 'center',
              minWidth: 180
            },
            '.seriesSearchContainer': {
              position: 'relative',
              flexGrow: 1
            },
            '.seriesSearchContainerOpen .seriesSearchSuggestions': {
              position: 'absolute',
              top: 42,
              zIndex: 2,
              overflowY: 'auto',
              minWidth: '100%',
              maxHeight: 230,
              backgroundColor: muiTheme.palette.background.paper,
              color: muiTheme.palette.text.primary,
              borderRadius: muiTheme.shape.borderRadius,
              boxShadow: muiTheme.shadows[4]
            },
            '.seriesSearchList': {
              margin: 0,
              padding: 0,
              listStyle: 'none'
            },
            '.seriesSearchItem': {
              padding: '4px 16px'
            },
            '.seriesSearchItemHighlighted': {
              backgroundColor: muiTheme.palette.action.hover
            },
            '.seriesSearchSectionTitle': {
              padding: '5px 8px',
              color: muiTheme.palette.text.secondary
            }
          })}
        />
        <Icon name={icons.SEARCH} />

        <Autosuggest
          ref={this.setAutosuggestRef}
          inputProps={inputProps}
          renderInputComponent={(autosuggestProps) => {
            const { ref, ...rest } = autosuggestProps;

            return (
              <TextField
                inputRef={ref}
                variant="outlined"
                size="small"
                fullWidth={true}
                {...rest}
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
              />
            );
          }}
          theme={theme}
          focusInputOnSuggestionClick={false}
          multiSection={true}
          suggestions={suggestionGroups}
          getSectionSuggestions={this.getSectionSuggestions}
          renderSectionTitle={this.renderSectionTitle}
          getSuggestionValue={this.getSuggestionValue}
          renderSuggestion={this.renderSuggestion}
          onSuggestionSelected={this.onSuggestionSelected}
          onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        />
      </div>
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
