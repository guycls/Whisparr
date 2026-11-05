import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import { toggleEpisodesMonitored } from 'Store/Actions/episodeActions';
import {
  fetchSeriesDetailsEpisodeOrder,
  fetchSeriesDetailsUnifiedGridWindow,
  fetchSeriesSceneBookmarks,
  getSceneBookmarkListKey,
  toggleSeriesSceneBookmark
} from 'Store/Actions/seriesDetailsActions';
import createDimensionsSelector from 'Store/Selectors/createDimensionsSelector';
import translate from 'Utilities/String/translate';
import SeriesDetailsBookmarkRail from './SeriesDetailsBookmarkRail';
import SeriesDetailsVirtualEpisodeGrid from './SeriesDetailsVirtualEpisodeGrid';

function createMapStateToProps() {
  return createSelector(
    (state) => state.seriesDetails.unifiedGrid,
    (state) => state.seriesDetails.sceneBookmarks,
    (state) => state.seriesDetails.monitorStatusFilter,
    (state) => state.seriesDetails.qualityFilter,
    (state) => state.seriesDetails.runtimeFilter,
    createDimensionsSelector(),
    (unifiedGrid, sceneBookmarks, monitorStatusFilter, qualityFilter, runtimeFilter, dimensions) => {
      return {
        ...unifiedGrid,
        sceneBookmarks,
        monitorStatusFilter,
        qualityFilter,
        runtimeFilter,
        isSmallScreen: dimensions.isSmallScreen
      };
    }
  );
}

const UNIFIED_GRID_WINDOW_FETCH_DELAY = 100;

const mapDispatchToProps = {
  fetchSeriesDetailsEpisodeOrder,
  fetchSeriesDetailsUnifiedGridWindow,
  fetchSeriesSceneBookmarks,
  toggleSeriesSceneBookmark,
  toggleEpisodesMonitored
};

function SeriesDetailsUnifiedGridConnector(props) {
  const {
    seriesId,
    sortKey,
    sortDirection,
    monitorStatusFilter,
    qualityFilter,
    runtimeFilter,
    sceneOrder = [],
    windowPages,
    isSceneOrderFetching,
    isSceneOrderPopulated,
    sceneOrderError,
    error,
    sceneBookmarks,
    isSmallScreen,
    isSelectMode = false,
    fetchSeriesDetailsEpisodeOrder: fetchOrder,
    fetchSeriesDetailsUnifiedGridWindow: fetchWindow,
    fetchSeriesSceneBookmarks: fetchBookmarks,
    toggleSeriesSceneBookmark: toggleBookmark,
    toggleEpisodesMonitored: toggleMonitored
  } = props;

  const gridRef = useRef(null);
  const windowFetchTimerRef = useRef(null);
  const [geometry, setGeometry] = useState({ columns: 1, rowStride: 0 });
  const bookmarkedIds = (sceneBookmarks && sceneBookmarks[getSceneBookmarkListKey(sortKey, sortDirection)]) || [];
  const qualityKey = qualityFilter ? `${qualityFilter.minIndex}:${qualityFilter.maxIndex}` : '';
  const runtimeKey = runtimeFilter ? `${runtimeFilter.minMinutes}:${runtimeFilter.maxMinutes}` : '';

  useEffect(() => {
    fetchBookmarks({ seriesId });
  }, [seriesId, fetchBookmarks]);

  useEffect(() => {
    fetchOrder({ seriesId });
  }, [seriesId, sortKey, sortDirection, monitorStatusFilter, qualityKey, runtimeKey, fetchOrder]);

  useEffect(() => {
    return () => {
      if (windowFetchTimerRef.current) {
        clearTimeout(windowFetchTimerRef.current);
        windowFetchTimerRef.current = null;
      }
    };
  }, [seriesId, sortKey, sortDirection, monitorStatusFilter, qualityKey, runtimeKey]);

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

  const onGeometryChange = useCallback((nextGeometry) => {
    setGeometry((current) => {
      if (
        current.columns === nextGeometry.columns &&
        current.rowStride === nextGeometry.rowStride
      ) {
        return current;
      }

      return nextGeometry;
    });
  }, []);

  const onVisiblePagesChange = useCallback((pages) => {
    if (windowFetchTimerRef.current) {
      clearTimeout(windowFetchTimerRef.current);
      windowFetchTimerRef.current = null;
    }

    if (!pages.length) {
      return;
    }

    windowFetchTimerRef.current = setTimeout(() => {
      windowFetchTimerRef.current = null;
      const startPage = pages[0];
      const endPage = pages[pages.length - 1];

      pages.forEach((page) => {
        fetchWindow({
          seriesId,
          page,
          startPage,
          endPage
        });
      });
    }, UNIFIED_GRID_WINDOW_FETCH_DELAY);
  }, [fetchWindow, seriesId]);

  if (!isSceneOrderPopulated && !sceneOrderError) {
    return (
      <Box sx={{ p: '15px' }}>
        <LoadingIndicator />
      </Box>
    );
  }

  if (sceneOrderError || error) {
    return (
      <Box sx={{ p: '15px' }}>
        {translate('EpisodesLoadError')}
      </Box>
    );
  }

  if (isSceneOrderPopulated && !sceneOrder.length && !isSceneOrderFetching) {
    return (
      <Box sx={{ p: '15px' }}>
        {translate('NoEpisodesMatchFilters')}
      </Box>
    );
  }

  return (
    <div>
      <Box>
        <Box sx={{ px: '15px', pb: '15px' }}>
          <SeriesDetailsVirtualEpisodeGrid
            ref={gridRef}
            sceneCount={sceneOrder.length}
            orderAnchorId={sceneOrder[0] ? sceneOrder[0].id : 0}
            windowPages={windowPages}
            isSmallScreen={isSmallScreen}
            isSelectMode={isSelectMode}
            episodeEntity="seriesDetails.unifiedGrid"
            bookmarkedIds={bookmarkedIds}
            onBookmarkPress={onBookmarkPress}
            onMonitorEpisodePress={onMonitorEpisodePress}
            onGeometryChange={onGeometryChange}
            onVisiblePagesChange={onVisiblePagesChange}
          />
        </Box>

        <SeriesDetailsBookmarkRail
          anchorRef={gridRef}
          episodeIds={bookmarkedIds}
          sceneOrder={sceneOrder}
          columns={geometry.columns}
          rowStride={geometry.rowStride}
        />
      </Box>

      <Typography
        sx={{
          px: '15px',
          pb: '15px',
          color: 'text.disabled',
          fontSize: 12,
          textAlign: 'center'
        }}
      >
        {sceneOrder.length} {translate('Episodes')}
      </Typography>
    </div>
  );
}

SeriesDetailsUnifiedGridConnector.propTypes = {
  seriesId: PropTypes.number.isRequired,
  isSelectMode: PropTypes.bool,
  sortKey: PropTypes.string,
  sortDirection: PropTypes.string,
  monitorStatusFilter: PropTypes.string,
  qualityFilter: PropTypes.object,
  runtimeFilter: PropTypes.object,
  sceneOrder: PropTypes.arrayOf(PropTypes.object),
  windowPages: PropTypes.object,
  isSceneOrderFetching: PropTypes.bool,
  isSceneOrderPopulated: PropTypes.bool,
  sceneOrderError: PropTypes.object,
  error: PropTypes.object,
  sceneBookmarks: PropTypes.object,
  isSmallScreen: PropTypes.bool.isRequired,
  fetchSeriesDetailsEpisodeOrder: PropTypes.func.isRequired,
  fetchSeriesDetailsUnifiedGridWindow: PropTypes.func.isRequired,
  fetchSeriesSceneBookmarks: PropTypes.func.isRequired,
  toggleSeriesSceneBookmark: PropTypes.func.isRequired,
  toggleEpisodesMonitored: PropTypes.func.isRequired
};

export default connect(createMapStateToProps, mapDispatchToProps)(SeriesDetailsUnifiedGridConnector);
