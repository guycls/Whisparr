import { createAction } from 'redux-actions';
import { sortDirections } from 'Helpers/Props';
import { createThunk, handleThunks } from 'Store/thunks';
import createAjaxRequest from 'Utilities/createAjaxRequest';
import {
  getResolvedRuntimeMaxMinutes,
  isFullRuntimeRange,
  resolveRuntimeFilter,
} from 'Utilities/Number/runtimeFilterUtils';
import {
  QUALITY_FILTER_MAX_INDEX,
} from 'Utilities/Quality/qualityFilterTiers';
import serverSideCollectionHandlers from 'Utilities/State/serverSideCollectionHandlers';
import { set } from './baseActions';
import createHandleActions from './Creators/createHandleActions';
import createFetchServerSideCollectionHandler from './Creators/createFetchServerSideCollectionHandler';
import createServerSideCollectionHandlers from './Creators/createServerSideCollectionHandlers';
import createClearReducer from './Creators/Reducers/createClearReducer';

//
// Variables

export const section = 'seriesDetails';

//
// State

export const defaultState = {
  view: 'unifiedGrid',
  monitorStatusFilter: 'all',
  qualityFilter: {
    minIndex: 0,
    maxIndex: 6,
  },
  runtimeFilter: {
    minMinutes: 0,
    maxMinutes: null,
  },
  maxEpisodeRuntime: 0,
  activeSeriesId: 0,
  isFilterBoundsFetching: false,
  isFilterBoundsPopulated: false,
  filterBoundsError: null,
  unifiedGrid: {
    isFetching: false,
    isPopulated: false,
    page: 1,
    pageSize: 25,
    sortKey: 'episodes.releaseDate',
    sortDirection: sortDirections.DESCENDING,
    totalRecords: 0,
    totalPages: 0,
    lastPageSize: 0,
    error: null,
    items: [],
  },
};

export const defaultRuntimeFilter = defaultState.runtimeFilter;

export const persistState = [
  'seriesDetails.view',
  'seriesDetails.monitorStatusFilter',
  'seriesDetails.qualityFilter',
];

//
// Actions Types

export const SET_SERIES_DETAILS_VIEW = 'seriesDetails/setSeriesDetailsView';
export const SET_SERIES_DETAILS_MONITOR_STATUS_FILTER = 'seriesDetails/setSeriesDetailsMonitorStatusFilter';
export const SET_SERIES_DETAILS_QUALITY_FILTER = 'seriesDetails/setSeriesDetailsQualityFilter';
export const SET_SERIES_DETAILS_RUNTIME_FILTER = 'seriesDetails/setSeriesDetailsRuntimeFilter';
export const SET_SERIES_DETAILS_ACTIVE_SERIES = 'seriesDetails/setSeriesDetailsActiveSeries';
export const FETCH_SERIES_DETAILS_FILTER_BOUNDS = 'seriesDetails/fetchSeriesDetailsFilterBounds';
export const FETCH_SERIES_DETAILS_UNIFIED_GRID = 'seriesDetails/fetchSeriesDetailsUnifiedGrid';
export const FETCH_MORE_SERIES_DETAILS_UNIFIED_GRID = 'seriesDetails/fetchMoreSeriesDetailsUnifiedGrid';
export const GOTO_FIRST_SERIES_DETAILS_UNIFIED_GRID_PAGE = 'seriesDetails/gotoFirstSeriesDetailsUnifiedGridPage';
export const CLEAR_SERIES_DETAILS_UNIFIED_GRID = 'seriesDetails/clearSeriesDetailsUnifiedGrid';

//
// Action Creators

export const setSeriesDetailsView = createAction(SET_SERIES_DETAILS_VIEW);
export const setSeriesDetailsMonitorStatusFilter = createAction(SET_SERIES_DETAILS_MONITOR_STATUS_FILTER);
export const setSeriesDetailsQualityFilter = createAction(SET_SERIES_DETAILS_QUALITY_FILTER);
export const setSeriesDetailsRuntimeFilter = createAction(SET_SERIES_DETAILS_RUNTIME_FILTER);
export const setSeriesDetailsActiveSeries = createAction(SET_SERIES_DETAILS_ACTIVE_SERIES);
export const fetchSeriesDetailsFilterBounds = createThunk(FETCH_SERIES_DETAILS_FILTER_BOUNDS);
export const fetchSeriesDetailsUnifiedGrid = createThunk(FETCH_SERIES_DETAILS_UNIFIED_GRID);
export const fetchMoreSeriesDetailsUnifiedGrid = createThunk(FETCH_MORE_SERIES_DETAILS_UNIFIED_GRID);
export const gotoSeriesDetailsUnifiedGridFirstPage = createThunk(GOTO_FIRST_SERIES_DETAILS_UNIFIED_GRID_PAGE);
export const clearSeriesDetailsUnifiedGrid = createAction(CLEAR_SERIES_DETAILS_UNIFIED_GRID);

function unifiedGridFetchDataAugmenter(getState, payload, data) {
  const {
    monitorStatusFilter,
    qualityFilter,
    runtimeFilter,
    maxEpisodeRuntime,
    activeSeriesId,
  } = getState().seriesDetails;

  const seriesId = payload.seriesId || activeSeriesId;

  const resolvedQualityFilter = qualityFilter ?? {
    minIndex: 0,
    maxIndex: QUALITY_FILTER_MAX_INDEX,
  };

  const resolvedRuntimeFilter = resolveRuntimeFilter(
    runtimeFilter ?? {
      minMinutes: 0,
      maxMinutes: null,
    },
    maxEpisodeRuntime
  );

  data.seriesId = seriesId;
  data.includeImages = true;
  data.monitorStatus = monitorStatusFilter ?? 'all';
  data.qualityMinIndex = resolvedQualityFilter.minIndex;
  data.qualityMaxIndex = resolvedQualityFilter.maxIndex;

  if (
    maxEpisodeRuntime > 0 &&
    !isFullRuntimeRange(
      resolvedRuntimeFilter.minMinutes,
      resolvedRuntimeFilter.maxMinutes,
      maxEpisodeRuntime
    )
  ) {
    data.runtimeMinMinutes = resolvedRuntimeFilter.minMinutes;
    data.runtimeMaxMinutes = getResolvedRuntimeMaxMinutes(
      resolvedRuntimeFilter.maxMinutes,
      maxEpisodeRuntime
    ) ?? maxEpisodeRuntime;
  }
}

function processUnifiedGridFetchResponse(getState, payload, response, sectionState) {
  const append = payload.append === true;
  const lastPageSize = response.records?.length ?? 0;
  let data = response;
  const extraSetState = { lastPageSize };

  if (lastPageSize === 0 && response.page > 1) {
    const existingItems = append ? (sectionState.items || []) : [];
    const pageSize = response.pageSize || sectionState.pageSize || 25;
    const totalRecords = existingItems.length;

    data = {
      ...response,
      totalRecords,
      totalPages: Math.max(Math.ceil(totalRecords / pageSize), 1)
    };
  }

  return { data, extraSetState };
}

const unifiedGridFetchHandler = createFetchServerSideCollectionHandler(
  'seriesDetails.unifiedGrid',
  '/episode/paged',
  unifiedGridFetchDataAugmenter,
  processUnifiedGridFetchResponse
);

//
// Action Handlers

export const actionHandlers = handleThunks({
  [FETCH_SERIES_DETAILS_FILTER_BOUNDS]: function(getState, payload, dispatch) {
    dispatch(set({
      section,
      isFilterBoundsFetching: true,
    }));

    const promise = createAjaxRequest({
      url: '/episode/filterBounds',
      data: {
        seriesId: payload.seriesId,
      },
    }).request;

    promise.done((response) => {
      dispatch(set({
        section,
        maxEpisodeRuntime: response.maxEpisodeRuntime,
        isFilterBoundsFetching: false,
        isFilterBoundsPopulated: true,
        filterBoundsError: null,
      }));
    });

    promise.fail((xhr) => {
      dispatch(set({
        section,
        isFilterBoundsFetching: false,
        isFilterBoundsPopulated: false,
        filterBoundsError: xhr,
      }));
    });
  },

  ...(() => {
    const serverSideHandlers = createServerSideCollectionHandlers(
      'seriesDetails.unifiedGrid',
      '/episode/paged',
      fetchSeriesDetailsUnifiedGrid,
      {
        [serverSideCollectionHandlers.FETCH]: FETCH_SERIES_DETAILS_UNIFIED_GRID,
        [serverSideCollectionHandlers.FIRST_PAGE]: GOTO_FIRST_SERIES_DETAILS_UNIFIED_GRID_PAGE,
      },
      unifiedGridFetchDataAugmenter
    );

    serverSideHandlers[FETCH_SERIES_DETAILS_UNIFIED_GRID] = unifiedGridFetchHandler;

    return serverSideHandlers;
  })(),

  [FETCH_MORE_SERIES_DETAILS_UNIFIED_GRID]: function(getState, payload, dispatch) {
    const { activeSeriesId } = getState().seriesDetails;
    const unifiedGrid = getState().seriesDetails.unifiedGrid;
    const seriesId = payload.seriesId || activeSeriesId;

    if (
      unifiedGrid.isFetching ||
      !unifiedGrid.isPopulated ||
      !unifiedGrid.totalRecords ||
      unifiedGrid.page >= unifiedGrid.totalPages ||
      (unifiedGrid.lastPageSize === 0 && unifiedGrid.page > 1) ||
      !seriesId
    ) {
      return;
    }

    unifiedGridFetchHandler(getState, {
      page: unifiedGrid.page + 1,
      append: true,
      seriesId,
    }, dispatch);
  },
});

//
// Reducers

export const reducers = createHandleActions({

  [SET_SERIES_DETAILS_VIEW]: function(state, { payload }) {
    return Object.assign({}, state, { view: payload.view });
  },

  [SET_SERIES_DETAILS_MONITOR_STATUS_FILTER]: function(state, { payload }) {
    return Object.assign({}, state, { monitorStatusFilter: payload.monitorStatusFilter });
  },

  [SET_SERIES_DETAILS_QUALITY_FILTER]: function(state, { payload }) {
    return Object.assign({}, state, { qualityFilter: payload.qualityFilter });
  },

  [SET_SERIES_DETAILS_RUNTIME_FILTER]: function(state, { payload }) {
    return Object.assign({}, state, { runtimeFilter: payload.runtimeFilter });
  },

  [SET_SERIES_DETAILS_ACTIVE_SERIES]: function(state, { payload }) {
    return Object.assign({}, state, { activeSeriesId: payload.seriesId });
  },

  [CLEAR_SERIES_DETAILS_UNIFIED_GRID]: createClearReducer(
    'seriesDetails.unifiedGrid',
    {
      isFetching: false,
      isPopulated: false,
      error: null,
      items: [],
      totalPages: 0,
      totalRecords: 0,
      lastPageSize: 0,
      page: 1,
    }
  ),

}, defaultState, section);
