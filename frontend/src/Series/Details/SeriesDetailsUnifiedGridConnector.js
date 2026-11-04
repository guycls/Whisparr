import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import { toggleEpisodesMonitored } from 'Store/Actions/episodeActions';
import {
  fetchMoreSeriesDetailsUnifiedGrid,
  fetchSeriesSceneBookmarks,
  getSceneBookmarkListKey,
  toggleSeriesSceneBookmark
} from 'Store/Actions/seriesDetailsActions';
import createDimensionsSelector from 'Store/Selectors/createDimensionsSelector';
import translate from 'Utilities/String/translate';
import SeriesDetailsBookmarkRail from './SeriesDetailsBookmarkRail';
import SeriesDetailsEpisodeGrid from './SeriesDetailsEpisodeGrid';

function createMapStateToProps() {
  return createSelector(
    (state) => state.seriesDetails.unifiedGrid,
    (state) => state.seriesDetails.sceneBookmarks,
    createDimensionsSelector(),
    (unifiedGrid, sceneBookmarks, dimensions) => {
      return {
        ...unifiedGrid,
        sceneBookmarks,
        isSmallScreen: dimensions.isSmallScreen
      };
    }
  );
}

const mapDispatchToProps = {
  fetchMoreSeriesDetailsUnifiedGrid,
  fetchSeriesSceneBookmarks,
  toggleSeriesSceneBookmark,
  toggleEpisodesMonitored
};

function SeriesDetailsUnifiedGridConnector(props) {
  const {
    seriesId,
    items,
    page,
    totalPages,
    totalRecords,
    lastPageSize,
    isFetching,
    isPopulated,
    error,
    sortKey,
    sortDirection,
    sceneBookmarks,
    isSmallScreen,
    isSelectMode = false,
    fetchMoreSeriesDetailsUnifiedGrid: fetchMore,
    fetchSeriesSceneBookmarks: fetchBookmarks,
    toggleSeriesSceneBookmark: toggleBookmark,
    toggleEpisodesMonitored: toggleMonitored
  } = props;

  const gridAnchorRef = useRef(null);
  const bookmarkedIds = (sceneBookmarks && sceneBookmarks[getSceneBookmarkListKey(sortKey, sortDirection)]) || [];

  useEffect(() => {
    fetchBookmarks({ seriesId });
  }, [seriesId, fetchBookmarks]);

  useEffect(() => {
    if (
      isPopulated &&
      !isFetching &&
      !error &&
      totalRecords > 0 &&
      items.length < totalRecords &&
      page < totalPages &&
      lastPageSize > 0
    ) {
      fetchMore({ seriesId });
    }
  }, [isPopulated, isFetching, error, totalRecords, items.length, page, totalPages, lastPageSize, seriesId, fetchMore]);

  const onMonitorEpisodePress = useCallback((episodeId, monitored) => {
    toggleMonitored({
      episodeIds: [episodeId],
      monitored,
      episodeEntity: 'seriesDetails.unifiedGrid'
    });
  }, [toggleMonitored]);

  const onBookmarkPress = useCallback((episodeId) => {
    toggleBookmark({
      seriesId,
      episodeId,
      sortKey,
      sortDirection
    });
  }, [seriesId, sortKey, sortDirection, toggleBookmark]);

  if (!isPopulated && isFetching) {
    return <LoadingIndicator />;
  }

  if (error) {
    return (
      <Box sx={{ p: '15px' }}>
        {translate('EpisodesLoadError')}
      </Box>
    );
  }

  if (isPopulated && !totalRecords) {
    return (
      <Box sx={{ p: '15px' }}>
        {translate('NoEpisodesMatchFilters')}
      </Box>
    );
  }

  const isLoadingMore = isFetching && items.length > 0;
  const isFullyLoaded = page >= totalPages && totalRecords > 0;

  return (
    <div>
      <Box ref={gridAnchorRef}>
        <Box sx={{ px: '15px', pb: '15px' }}>
          <SeriesDetailsEpisodeGrid
            items={items}
            isSmallScreen={isSmallScreen}
            isSelectMode={isSelectMode}
            episodeEntity="seriesDetails.unifiedGrid"
            bookmarkedIds={bookmarkedIds}
            onBookmarkPress={onBookmarkPress}
            onMonitorEpisodePress={onMonitorEpisodePress}
          />
        </Box>

        <SeriesDetailsBookmarkRail
          anchorRef={gridAnchorRef}
          episodeIds={bookmarkedIds}
          itemCount={items.length}
        />
      </Box>

      {isLoadingMore &&
        <Box sx={{ display: 'flex', justifyContent: 'center', p: '15px' }}>
          <LoadingIndicator />
        </Box>
      }

      {isFullyLoaded && !isLoadingMore &&
        <Typography
          sx={{
            px: '15px',
            pb: '15px',
            color: 'text.disabled',
            fontSize: 12,
            textAlign: 'center'
          }}
        >
          {totalRecords} {translate('Episodes')}
        </Typography>
      }
    </div>
  );
}

SeriesDetailsUnifiedGridConnector.propTypes = {
  seriesId: PropTypes.number.isRequired,
  isSelectMode: PropTypes.bool,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  page: PropTypes.number,
  totalPages: PropTypes.number,
  totalRecords: PropTypes.number,
  lastPageSize: PropTypes.number,
  isFetching: PropTypes.bool.isRequired,
  isPopulated: PropTypes.bool.isRequired,
  error: PropTypes.object,
  sortKey: PropTypes.string,
  sortDirection: PropTypes.string,
  sceneBookmarks: PropTypes.object,
  isSmallScreen: PropTypes.bool.isRequired,
  fetchMoreSeriesDetailsUnifiedGrid: PropTypes.func.isRequired,
  fetchSeriesSceneBookmarks: PropTypes.func.isRequired,
  toggleSeriesSceneBookmark: PropTypes.func.isRequired,
  toggleEpisodesMonitored: PropTypes.func.isRequired
};

export default connect(createMapStateToProps, mapDispatchToProps)(SeriesDetailsUnifiedGridConnector);
