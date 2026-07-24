import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createSelector } from 'reselect';
import * as commandNames from 'Commands/commandNames';
import { set } from 'Store/Actions/baseActions';
import { executeCommand } from 'Store/Actions/commandActions';
import { clearEpisodes, fetchEpisodes } from 'Store/Actions/episodeActions';
import { clearEpisodeFiles, fetchEpisodeFiles } from 'Store/Actions/episodeFileActions';
import { clearQueueDetails, fetchQueueDetails } from 'Store/Actions/queueActions';
import { toggleSeriesMonitored } from 'Store/Actions/seriesActions';
import {
  clearSeriesDetailsUnifiedGrid,
  defaultRuntimeFilter,
  fetchSeriesDetailsFilterBounds,
  fetchSeriesDetailsUnifiedGrid,
  gotoSeriesDetailsUnifiedGridFirstPage,
  section as seriesDetailsSection,
  setSeriesDetailsActiveSeries,
  setSeriesDetailsMonitorStatusFilter,
  setSeriesDetailsQualityFilter,
  setSeriesDetailsRuntimeFilter,
  setSeriesDetailsView
} from 'Store/Actions/seriesDetailsActions';
import { fetchDownloadClients } from 'Store/Actions/settingsActions';
import createAllSeriesSelector from 'Store/Selectors/createAllSeriesSelector';
import createCommandsSelector from 'Store/Selectors/createCommandsSelector';
import { findCommand, isCommandExecuting } from 'Utilities/Command';
import { resolveRuntimeFilter } from 'Utilities/Number/runtimeFilterUtils';
import { registerPagePopulator, unregisterPagePopulator } from 'Utilities/pagePopulator';
import filterAlternateTitles from 'Utilities/Series/filterAlternateTitles';
import { getSeriesDetailsToolbarState } from './getSeriesDetailsToolbarState';
import SeriesDetails from './SeriesDetails';

const selectEpisodes = createSelector(
  (state) => state.episodes,
  (episodes) => {
    const {
      items,
      isFetching,
      isPopulated,
      error
    } = episodes;

    const hasEpisodes = !!items.length;
    const hasMonitoredEpisodes = items.some((e) => e.monitored);

    return {
      items,
      isEpisodesFetching: isFetching,
      isEpisodesPopulated: isPopulated,
      episodesError: error,
      hasEpisodes,
      hasMonitoredEpisodes
    };
  }
);

const selectEpisodeFiles = createSelector(
  (state) => state.episodeFiles,
  (episodeFiles) => {
    const {
      items,
      isFetching,
      isPopulated,
      error
    } = episodeFiles;

    const hasEpisodeFiles = !!items.length;

    return {
      items,
      isEpisodeFilesFetching: isFetching,
      isEpisodeFilesPopulated: isPopulated,
      episodeFilesError: error,
      hasEpisodeFiles
    };
  }
);

function createMapStateToProps() {
  return createSelector(
    (state, { titleSlug }) => titleSlug,
    selectEpisodes,
    selectEpisodeFiles,
    createAllSeriesSelector(),
    createCommandsSelector(),
    (state) => state.settings.safeForWorkMode,
    (state) => state.seriesDetails.view,
    (state) => state.seriesDetails.monitorStatusFilter,
    (state) => state.seriesDetails.qualityFilter,
    (state) => state.seriesDetails.runtimeFilter,
    (state) => state.seriesDetails.maxEpisodeRuntime,
    (state) => state.settings.downloadClients,
    (titleSlug, episodes, episodeFiles, allSeries, commands, safeForWorkMode, view, monitorStatusFilter, qualityFilter, runtimeFilter, maxEpisodeRuntime, downloadClients) => {
      const resolvedQualityFilter = qualityFilter ?? { minIndex: 0, maxIndex: 6 };
      const resolvedRuntimeFilter = resolveRuntimeFilter(
        runtimeFilter ?? { minMinutes: 0, maxMinutes: null },
        maxEpisodeRuntime
      );
      const sortedSeries = _.orderBy(allSeries, 'sortTitle');
      const seriesIndex = _.findIndex(sortedSeries, { titleSlug });
      const series = sortedSeries[seriesIndex];

      if (!series) {
        return {};
      }

      const {
        items: episodeItems,
        isEpisodesFetching,
        isEpisodesPopulated,
        episodesError
      } = episodes;

      const {
        items: episodeFileItems,
        isEpisodeFilesFetching,
        isEpisodeFilesPopulated,
        episodeFilesError
      } = episodeFiles;

      const toolbarState = getSeriesDetailsToolbarState({
        episodeItems,
        episodeFileItems,
        statistics: series.statistics
      });

      const previousSeries = sortedSeries[seriesIndex - 1] || _.last(sortedSeries);
      const nextSeries = sortedSeries[seriesIndex + 1] || _.first(sortedSeries);
      const isSeriesRefreshing = isCommandExecuting(findCommand(commands, { name: commandNames.REFRESH_SERIES, seriesId: series.id }));
      const seriesRefreshingCommand = findCommand(commands, { name: commandNames.REFRESH_SERIES });
      const allSeriesRefreshing = (
        isCommandExecuting(seriesRefreshingCommand) &&
        !seriesRefreshingCommand.body.seriesId
      );
      const isRefreshing = isSeriesRefreshing || allSeriesRefreshing;
      const isSearching = isCommandExecuting(findCommand(commands, { name: commandNames.SERIES_SEARCH, seriesId: series.id }));
      const isRenamingFiles = isCommandExecuting(findCommand(commands, { name: commandNames.RENAME_FILES, seriesId: series.id }));
      const isRenamingSeriesCommand = findCommand(commands, { name: commandNames.RENAME_SERIES });
      const isRenamingSeries = (
        isCommandExecuting(isRenamingSeriesCommand) &&
        isRenamingSeriesCommand.body.seriesIds.indexOf(series.id) > -1
      );

      const isUnifiedGridView = view === 'unifiedGrid';
      const isFetching = isEpisodesFetching || isEpisodeFilesFetching;
      const isPopulated = isEpisodesPopulated && isEpisodeFilesPopulated;
      const alternateTitles = filterAlternateTitles(series.alternateTitles, series.title, series.useSceneNumbering);
      const downloadClientItems = downloadClients?.items ?? [];
      const hasQBittorrent = downloadClientItems.some((c) => c.enable && c.implementation === 'QBittorrent');

      return {
        ...series,
        alternateTitles,
        isSeriesRefreshing,
        allSeriesRefreshing,
        isRefreshing,
        isSearching,
        isRenamingFiles,
        isRenamingSeries,
        isFetching,
        isPopulated,
        episodesError,
        episodeFilesError,
        hasEpisodes: toolbarState.hasEpisodes,
        hasMonitoredEpisodes: toolbarState.hasMonitoredEpisodes,
        hasEpisodeFiles: toolbarState.hasEpisodeFiles,
        hasQBittorrent,
        isDownloadClientsPopulated: downloadClients?.isPopulated ?? false,
        isDownloadClientsFetching: downloadClients?.isFetching ?? false,
        previousSeries,
        nextSeries,
        safeForWorkMode,
        view,
        monitorStatusFilter,
        qualityFilter: resolvedQualityFilter,
        runtimeFilter: resolvedRuntimeFilter,
        rawQualityFilter: qualityFilter ?? { minIndex: 0, maxIndex: 6 },
        rawRuntimeFilter: runtimeFilter ?? { minMinutes: 0, maxMinutes: null },
        maxEpisodeRuntime
      };
    }
  );
}

const mapDispatchToProps = (dispatch) => {
  return {
    ...bindActionCreators({
      fetchEpisodes,
      clearEpisodes,
      fetchEpisodeFiles,
      clearEpisodeFiles,
      toggleSeriesMonitored,
      fetchQueueDetails,
      clearQueueDetails,
      executeCommand,
      setSeriesDetailsView,
      setSeriesDetailsMonitorStatusFilter,
      setSeriesDetailsQualityFilter,
      setSeriesDetailsRuntimeFilter,
      setSeriesDetailsActiveSeries,
      fetchSeriesDetailsFilterBounds,
      fetchSeriesDetailsUnifiedGrid,
      gotoSeriesDetailsUnifiedGridFirstPage,
      clearSeriesDetailsUnifiedGrid,
      fetchDownloadClients
    }, dispatch),

    resetRuntimeFilterForSeriesLoad() {
      dispatch(setSeriesDetailsRuntimeFilter({ runtimeFilter: defaultRuntimeFilter }));
      dispatch(set({
        section: seriesDetailsSection,
        maxEpisodeRuntime: 0,
        isFilterBoundsPopulated: false,
        isFilterBoundsFetching: false,
        filterBoundsError: null
      }));
    }
  };
};

class SeriesDetailsConnector extends Component {

  //
  // Lifecycle

  componentDidMount() {
    registerPagePopulator(this.populate, ['seriesUpdated']);
    this.props.resetRuntimeFilterForSeriesLoad();
    this.populate();

    const {
      isDownloadClientsPopulated,
      isDownloadClientsFetching
    } = this.props;

    if (!isDownloadClientsPopulated && !isDownloadClientsFetching) {
      this.props.fetchDownloadClients();
    }
  }

  componentDidUpdate(prevProps) {
    const {
      id,
      view,
      monitorStatusFilter,
      rawQualityFilter,
      rawRuntimeFilter,
      isSeriesRefreshing,
      allSeriesRefreshing,
      isRenamingFiles,
      isRenamingSeries
    } = this.props;

    if (
      (prevProps.isSeriesRefreshing && !isSeriesRefreshing) ||
      (prevProps.allSeriesRefreshing && !allSeriesRefreshing) ||
      (prevProps.isRenamingFiles && !isRenamingFiles) ||
      (prevProps.isRenamingSeries && !isRenamingSeries)
    ) {
      this.populate();
    }

    if (prevProps.id !== id) {
      this.unpopulate();
      this.props.resetRuntimeFilterForSeriesLoad();
      this.populate();
      return;
    }

    if (prevProps.view !== view) {
      this.populateForView(view);
      return;
    }

    if (
      view === 'unifiedGrid' &&
      (
        prevProps.monitorStatusFilter !== monitorStatusFilter ||
        !_.isEqual(prevProps.rawQualityFilter, rawQualityFilter) ||
        !_.isEqual(prevProps.rawRuntimeFilter, rawRuntimeFilter)
      )
    ) {
      this.refetchUnifiedGrid();
    }
  }

  componentWillUnmount() {
    unregisterPagePopulator(this.populate);
    this.unpopulate();
  }

  //
  // Control

  populate = () => {
    const seriesId = this.props.id;

    this.props.fetchSeriesDetailsFilterBounds({ seriesId });
    this.populateForView(this.props.view);
    this.props.fetchQueueDetails({ seriesId });
  };

  refetchUnifiedGrid = () => {
    this.props.clearSeriesDetailsUnifiedGrid();
    this.props.gotoSeriesDetailsUnifiedGridFirstPage({ seriesId: this.props.id });
  };

  populateForView = (view) => {
    const seriesId = this.props.id;

    this.props.setSeriesDetailsActiveSeries({ seriesId });

    if (view === 'unifiedGrid') {
      this.props.clearEpisodes();
      this.props.clearEpisodeFiles();
      this.props.clearSeriesDetailsUnifiedGrid();
      this.props.fetchSeriesDetailsUnifiedGrid({ seriesId });
      return;
    }

    this.props.clearSeriesDetailsUnifiedGrid();
    this.props.fetchEpisodes({ seriesId, includeImages: true });
    this.props.fetchEpisodeFiles({ seriesId });
  };

  unpopulate = () => {
    this.props.clearEpisodes();
    this.props.clearEpisodeFiles();
    this.props.clearSeriesDetailsUnifiedGrid();
    this.props.clearQueueDetails();
  };

  //
  // Listeners

  onMonitorTogglePress = (monitored) => {
    this.props.toggleSeriesMonitored({
      seriesId: this.props.id,
      monitored
    });
  };

  onRefreshPress = () => {
    this.props.executeCommand({
      name: commandNames.REFRESH_SERIES,
      seriesId: this.props.id
    });
  };

  onSearchPress = () => {
    this.props.executeCommand({
      name: commandNames.SERIES_SEARCH,
      seriesId: this.props.id
    });
  };

  onViewSelect = (view) => {
    this.props.setSeriesDetailsView({ view });
  };

  onStatusSelect = (monitorStatusFilter) => {
    this.props.setSeriesDetailsMonitorStatusFilter({ monitorStatusFilter });
  };

  onQualityFilterChange = (qualityFilter) => {
    this.props.setSeriesDetailsQualityFilter({ qualityFilter });
  };

  onRuntimeFilterChange = (runtimeFilter) => {
    this.props.setSeriesDetailsRuntimeFilter({ runtimeFilter });
  };

  //
  // Render

  render() {
    return (
      <SeriesDetails
        {...this.props}
        onMonitorTogglePress={this.onMonitorTogglePress}
        onRefreshPress={this.onRefreshPress}
        onSearchPress={this.onSearchPress}
        onViewSelect={this.onViewSelect}
        onStatusSelect={this.onStatusSelect}
        onQualityFilterChange={this.onQualityFilterChange}
        onRuntimeFilterChange={this.onRuntimeFilterChange}
      />
    );
  }
}

SeriesDetailsConnector.propTypes = {
  id: PropTypes.number.isRequired,
  titleSlug: PropTypes.string.isRequired,
  view: PropTypes.string.isRequired,
  monitorStatusFilter: PropTypes.string.isRequired,
  qualityFilter: PropTypes.object.isRequired,
  runtimeFilter: PropTypes.object.isRequired,
  maxEpisodeRuntime: PropTypes.number.isRequired,
  isSeriesRefreshing: PropTypes.bool.isRequired,
  allSeriesRefreshing: PropTypes.bool.isRequired,
  isRefreshing: PropTypes.bool.isRequired,
  isRenamingFiles: PropTypes.bool.isRequired,
  isRenamingSeries: PropTypes.bool.isRequired,
  fetchEpisodes: PropTypes.func.isRequired,
  clearEpisodes: PropTypes.func.isRequired,
  fetchEpisodeFiles: PropTypes.func.isRequired,
  clearEpisodeFiles: PropTypes.func.isRequired,
  toggleSeriesMonitored: PropTypes.func.isRequired,
  fetchQueueDetails: PropTypes.func.isRequired,
  clearQueueDetails: PropTypes.func.isRequired,
  executeCommand: PropTypes.func.isRequired,
  setSeriesDetailsView: PropTypes.func.isRequired,
  setSeriesDetailsMonitorStatusFilter: PropTypes.func.isRequired,
  setSeriesDetailsQualityFilter: PropTypes.func.isRequired,
  setSeriesDetailsRuntimeFilter: PropTypes.func.isRequired,
  setSeriesDetailsActiveSeries: PropTypes.func.isRequired,
  fetchSeriesDetailsFilterBounds: PropTypes.func.isRequired,
  fetchSeriesDetailsUnifiedGrid: PropTypes.func.isRequired,
  gotoSeriesDetailsUnifiedGridFirstPage: PropTypes.func.isRequired,
  clearSeriesDetailsUnifiedGrid: PropTypes.func.isRequired,
  resetRuntimeFilterForSeriesLoad: PropTypes.func.isRequired,
  fetchDownloadClients: PropTypes.func.isRequired,
  isDownloadClientsPopulated: PropTypes.bool,
  isDownloadClientsFetching: PropTypes.bool
};

export default connect(createMapStateToProps, mapDispatchToProps)(SeriesDetailsConnector);
