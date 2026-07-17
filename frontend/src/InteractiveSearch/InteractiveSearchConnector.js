import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import * as releaseActions from 'Store/Actions/releaseActions';
import { fetchIndexerOptions } from 'Store/Actions/settingsActions';
import createClientSideCollectionSelector from 'Store/Selectors/createClientSideCollectionSelector';
import createUISettingsSelector from 'Store/Selectors/createUISettingsSelector';
import getEpisodeIndexerSearchQuery from './getEpisodeIndexerSearchQuery';
import InteractiveSearch from './InteractiveSearch';

function createMapStateToProps(appState, { type, searchPayload }) {
  return createSelector(
    (state) => state.releases.items.length,
    createClientSideCollectionSelector('releases', `releases.${type}`),
    createUISettingsSelector(),
    (state) => state.releases.searchTerm,
    (state) => state.episodes.items,
    (state) => state.series.itemMap,
    (state) => state.series.items,
    (state) => state.settings.indexerOptions.isPopulated,
    (state) => state.settings.indexerOptions.item,
    (
      totalReleasesCount,
      releases,
      uiSettings,
      searchTerm,
      episodes,
      itemMap,
      allSeries,
      isIndexerOptionsPopulated,
      indexerOptions
    ) => {
      const episode = searchPayload?.episodeId != null ?
        episodes.find((item) => item.id === searchPayload.episodeId) :
        undefined;

      const series = searchPayload?.seriesId != null ?
        allSeries[itemMap[searchPayload.seriesId]] :
        undefined;

      const ignoreSceneDate = indexerOptions?.ignoreSceneDate ?? false;
      const defaultSearchTerm = getEpisodeIndexerSearchQuery(series, episode, ignoreSceneDate);

      return {
        totalReleasesCount,
        longDateFormat: uiSettings.longDateFormat,
        timeFormat: uiSettings.timeFormat,
        searchTerm: searchTerm || defaultSearchTerm,
        defaultSearchTerm,
        isIndexerOptionsPopulated,
        ...releases
      };
    }
  );
}

function createMapDispatchToProps(dispatch, props) {
  return {
    dispatchFetchReleases(payload) {
      dispatch(releaseActions.fetchReleases(payload));
    },

    dispatchFetchIndexerOptions() {
      dispatch(fetchIndexerOptions());
    },

    onSortPress(sortKey, sortDirection) {
      dispatch(releaseActions.setReleasesSort({ sortKey, sortDirection }));
    },

    onFilterSelect(selectedFilterKey) {
      const action = props.type === 'episode' ?
        releaseActions.setEpisodeReleasesFilter :
        releaseActions.setSeasonReleasesFilter;

      dispatch(action({ selectedFilterKey }));
    },

    onGrabPress(payload) {
      dispatch(releaseActions.grabRelease(payload));
    },

    onForceDownloadPress(payload) {
      dispatch(releaseActions.grabRelease(payload));
    }
  };
}

class InteractiveSearchConnector extends Component {

  //
  // Lifecycle

  componentDidMount() {
    const { type, isIndexerOptionsPopulated, dispatchFetchIndexerOptions } = this.props;

    if (type === 'episode' && !isIndexerOptionsPopulated) {
      dispatchFetchIndexerOptions();
      return;
    }

    this.fetchIfNeeded();
  }

  componentDidUpdate(prevProps) {
    const { type } = this.props;

    if (type === 'episode' &&
        !prevProps.isIndexerOptionsPopulated &&
        this.props.isIndexerOptionsPopulated) {
      this.fetchIfNeeded();
    }
  }

  fetchIfNeeded() {
    const {
      searchPayload,
      isPopulated,
      searchTerm,
      defaultSearchTerm,
      dispatchFetchReleases
    } = this.props;

    if (!isPopulated) {
      dispatchFetchReleases({
        ...searchPayload,
        searchTerm: searchTerm || defaultSearchTerm
      });
    }
  }

  //
  // Listeners

  onIndexerSearchSubmit = (indexerSearchTerm) => {
    const { searchPayload, dispatchFetchReleases } = this.props;

    dispatchFetchReleases({
      ...searchPayload,
      searchTerm: indexerSearchTerm
    });
  };

  //
  // Render

  render() {
    const {
      dispatchFetchReleases,
      dispatchFetchIndexerOptions,
      type,
      searchTerm,
      ...otherProps
    } = this.props;

    return (
      <InteractiveSearch
        {...otherProps}
        type={type}
        stackedTitleLayout={type === 'episode'}
        indexerSearchTerm={searchTerm}
        onIndexerSearchSubmit={this.onIndexerSearchSubmit}
      />
    );
  }
}

InteractiveSearchConnector.propTypes = {
  type: PropTypes.string.isRequired,
  searchPayload: PropTypes.object.isRequired,
  isPopulated: PropTypes.bool,
  isIndexerOptionsPopulated: PropTypes.bool,
  searchTerm: PropTypes.string,
  defaultSearchTerm: PropTypes.string,
  dispatchFetchReleases: PropTypes.func,
  dispatchFetchIndexerOptions: PropTypes.func
};

export default connect(createMapStateToProps, createMapDispatchToProps)(InteractiveSearchConnector);
