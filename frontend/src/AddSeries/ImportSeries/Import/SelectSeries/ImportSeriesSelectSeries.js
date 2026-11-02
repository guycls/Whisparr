import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Manager, Popper, Reference } from 'react-popper';
import FormInputButton from 'Components/Form/FormInputButton';
import TextInput from 'Components/Form/TextInput';
import Icon from 'Components/Icon';
import Link from 'Components/Link/Link';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import Portal from 'Components/Portal';
import { icons, kinds } from 'Helpers/Props';
import getUniqueElementId from 'Utilities/getUniqueElementId';
import translate from 'Utilities/String/translate';
import ImportSeriesSearchResultConnector from './ImportSeriesSearchResultConnector';
import ImportSeriesTitle from './ImportSeriesTitle';

class ImportSeriesSelectSeries extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this._seriesLookupTimeout = null;
    this._scheduleUpdate = null;
    this._buttonId = getUniqueElementId();
    this._contentId = getUniqueElementId();

    this.state = {
      term: props.id,
      isOpen: false
    };
  }

  componentDidUpdate() {
    if (this._scheduleUpdate) {
      this._scheduleUpdate();
    }
  }

  //
  // Control

  _addListener() {
    window.addEventListener('click', this.onWindowClick);
  }

  _removeListener() {
    window.removeEventListener('click', this.onWindowClick);
  }

  //
  // Listeners

  onWindowClick = (event) => {
    const button = document.getElementById(this._buttonId);
    const content = document.getElementById(this._contentId);

    if (!button || !content) {
      return;
    }

    if (
      !button.contains(event.target) &&
      !content.contains(event.target) &&
      this.state.isOpen
    ) {
      this.setState({ isOpen: false });
      this._removeListener();
    }
  };

  onPress = () => {
    if (this.state.isOpen) {
      this._removeListener();
    } else {
      this._addListener();
    }

    this.setState({ isOpen: !this.state.isOpen });
  };

  onSearchInputChange = ({ value }) => {
    if (this._seriesLookupTimeout) {
      clearTimeout(this._seriesLookupTimeout);
    }

    this.setState({ term: value }, () => {
      this._seriesLookupTimeout = setTimeout(() => {
        this.props.onSearchInputChange(value);
      }, 200);
    });
  };

  onRefreshPress = () => {
    this.props.onSearchInputChange(this.state.term);
  };

  onSeriesSelect = (tvdbId) => {
    this.setState({ isOpen: false });

    this.props.onSeriesSelect(tvdbId);
  };

  //
  // Render

  render() {
    const {
      selectedSeries,
      isExistingSeries,
      isFetching,
      isPopulated,
      error,
      items,
      isQueued,
      isLookingUpSeries
    } = this.props;

    const errorMessage = error &&
      error.responseJSON &&
      error.responseJSON.message;

    return (
      <Manager>
        <Reference>
          {({ ref }) => (
            <div
              ref={ref}
              id={this._buttonId}
            >
              <Link
                ref={ref}
                component="div"
                onPress={this.onPress}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  py: '6px',
                  px: '16px',
                  width: '100%',
                  height: 35,
                  border: '1px solid var(--inputBorderColor)',
                  borderRadius: '4px',
                  backgroundColor: 'var(--inputBackgroundColor)',
                  boxShadow: 'inset 0 1px 1px var(--inputBoxShadowColor)'
                }}
              >
                {
                  isLookingUpSeries && isQueued && !isPopulated ?
                    <Box component="span" sx={{ display: 'inline-block' }}>
                      <LoadingIndicator
                        size={20}
                      />
                    </Box> :
                    null
                }

                {
                  isPopulated && selectedSeries && isExistingSeries ?
                    <Box component="span" sx={{ mr: '8px', display: 'inline-flex' }}>
                      <Icon
                        name={icons.WARNING}
                        kind={kinds.WARNING}
                      />
                    </Box> :
                    null
                }

                {
                  isPopulated && selectedSeries ?
                    <ImportSeriesTitle
                      title={selectedSeries.title}
                      year={selectedSeries.year}
                      network={selectedSeries.network}
                      isExistingSeries={isExistingSeries}
                    /> :
                    null
                }

                {
                  isPopulated && !selectedSeries ?
                    <div>
                      <Box component="span" sx={{ mr: '8px', display: 'inline-flex' }}>
                        <Icon
                          name={icons.WARNING}
                          kind={kinds.WARNING}
                        />
                      </Box>

                      {translate('NoMatchFound')}
                    </div> :
                    null
                }

                {
                  !isFetching && !!error ?
                    <div>
                      <Box component="span" sx={{ mr: '8px', display: 'inline-flex' }}>
                        <Icon
                          title={errorMessage}
                          name={icons.WARNING}
                          kind={kinds.WARNING}
                        />
                      </Box>

                      {translate('SearchFailedError')}
                    </div> :
                    null
                }

                <Box sx={{ flex: '1 0 auto', ml: '5px', textAlign: 'right' }}>
                  <Icon
                    name={icons.CARET_DOWN}
                  />
                </Box>
              </Link>
            </div>
          )}
        </Reference>

        <Portal>
          <Popper
            placement="bottom"
            modifiers={{
              preventOverflow: {
                boundariesElement: 'viewport'
              }
            }}
          >
            {({ ref, style, scheduleUpdate }) => {
              this._scheduleUpdate = scheduleUpdate;

              return (
                <Box
                  ref={ref}
                  id={this._contentId}
                  style={style}
                  sx={{
                    zIndex: 2000,
                    mt: '4px',
                    width: 384
                  }}
                >
                  {
                    this.state.isOpen ?
                      <Box
                        sx={{
                          p: '4px',
                          border: '1px solid var(--inputBorderColor)',
                          borderRadius: '4px',
                          backgroundColor: 'var(--inputBackgroundColor)'
                        }}
                      >
                        <Box sx={{ display: 'flex' }}>
                          <Box
                            sx={{
                              width: 58,
                              border: '1px solid var(--inputBorderColor)',
                              borderRight: 'none',
                              borderRadius: '4px 0 0 4px',
                              backgroundColor: 'var(--searchIconContainerBackgroundColor)',
                              textAlign: 'center',
                              lineHeight: '33px'
                            }}
                          >
                            <Icon name={icons.SEARCH} />
                          </Box>

                          <Box sx={{ flex: 1, '& .MuiInputBase-root': { borderRadius: 0 } }}>
                            <TextInput
                              name={`${name}_textInput`}
                              value={this.state.term}
                              onChange={this.onSearchInputChange}
                            />
                          </Box>

                          <FormInputButton
                            kind={kinds.DEFAULT}
                            spinnerIcon={icons.REFRESH}
                            canSpin={true}
                            isSpinning={isFetching}
                            onPress={this.onRefreshPress}
                          >
                            <Icon name={icons.REFRESH} />
                          </FormInputButton>
                        </Box>

                        <Box
                          sx={{
                            overflowX: 'hidden',
                            overflowY: 'scroll',
                            maxHeight: 165,
                            scrollbarColor: 'var(--scrollbarBackgroundColor) transparent',
                            scrollbarWidth: 'thin',
                            '&::-webkit-scrollbar': {
                              width: 10,
                              height: 10
                            },
                            '&::-webkit-scrollbar-track': {
                              backgroundColor: 'transparent'
                            },
                            '&::-webkit-scrollbar-thumb': {
                              minHeight: 100,
                              border: '1px solid transparent',
                              borderRadius: '5px',
                              backgroundColor: 'var(--scrollbarBackgroundColor)',
                              backgroundClip: 'padding-box',
                              '&:hover': {
                                backgroundColor: 'var(--scrollbarHoverBackgroundColor)'
                              }
                            }
                          }}
                        >
                          {
                            items.map((item) => {
                              return (
                                <ImportSeriesSearchResultConnector
                                  key={item.tvdbId}
                                  tvdbId={item.tvdbId}
                                  title={item.title}
                                  year={item.year}
                                  network={item.network}
                                  onPress={this.onSeriesSelect}
                                />
                              );
                            })
                          }
                        </Box>
                      </Box> :
                      null
                  }
                </Box>
              );
            }}
          </Popper>
        </Portal>
      </Manager>
    );
  }
}

ImportSeriesSelectSeries.propTypes = {
  id: PropTypes.string.isRequired,
  selectedSeries: PropTypes.object,
  isExistingSeries: PropTypes.bool.isRequired,
  isFetching: PropTypes.bool.isRequired,
  isPopulated: PropTypes.bool.isRequired,
  error: PropTypes.object,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  isQueued: PropTypes.bool.isRequired,
  isLookingUpSeries: PropTypes.bool.isRequired,
  onSearchInputChange: PropTypes.func.isRequired,
  onSeriesSelect: PropTypes.func.isRequired
};

ImportSeriesSelectSeries.defaultProps = {
  isFetching: true,
  isPopulated: false,
  items: [],
  isQueued: true
};

export default ImportSeriesSelectSeries;
