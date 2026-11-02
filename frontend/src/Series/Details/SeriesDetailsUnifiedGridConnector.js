import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import { toggleEpisodesMonitored } from 'Store/Actions/episodeActions';
import {
  fetchMoreSeriesDetailsUnifiedGrid
} from 'Store/Actions/seriesDetailsActions';
import createDimensionsSelector from 'Store/Selectors/createDimensionsSelector';
import translate from 'Utilities/String/translate';
import SeriesDetailsEpisodeGrid from './SeriesDetailsEpisodeGrid';

function createMapStateToProps() {
  return createSelector(
    (state) => state.seriesDetails.unifiedGrid,
    createDimensionsSelector(),
    (unifiedGrid, dimensions) => {
      return {
        ...unifiedGrid,
        isSmallScreen: dimensions.isSmallScreen
      };
    }
  );
}

const mapDispatchToProps = {
  fetchMoreSeriesDetailsUnifiedGrid,
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
    isSmallScreen,
    fetchMoreSeriesDetailsUnifiedGrid: fetchMore,
    toggleEpisodesMonitored: toggleMonitored
  } = props;

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
      <Box sx={{ px: '15px', pb: '15px' }}>
        <SeriesDetailsEpisodeGrid
          items={items}
          isSmallScreen={isSmallScreen}
          episodeEntity="seriesDetails.unifiedGrid"
          onMonitorEpisodePress={onMonitorEpisodePress}
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
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  page: PropTypes.number,
  totalPages: PropTypes.number,
  totalRecords: PropTypes.number,
  lastPageSize: PropTypes.number,
  isFetching: PropTypes.bool.isRequired,
  isPopulated: PropTypes.bool.isRequired,
  error: PropTypes.object,
  isSmallScreen: PropTypes.bool.isRequired,
  fetchMoreSeriesDetailsUnifiedGrid: PropTypes.func.isRequired,
  toggleEpisodesMonitored: PropTypes.func.isRequired
};

export default connect(createMapStateToProps, mapDispatchToProps)(SeriesDetailsUnifiedGridConnector);
