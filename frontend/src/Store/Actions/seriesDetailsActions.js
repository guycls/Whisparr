import { createAction } from 'redux-actions';
import { sortDirections } from 'Helpers/Props';
import { createThunk, handleThunks } from 'Store/thunks';
import createAjaxRequest from 'Utilities/createAjaxRequest';
import {
  getResolvedRuntimeMaxMinutes,
  isFullRuntimeRange,
  resolveRuntimeFilter
} from 'Utilities/Number/runtimeFilterUtils';
import reconcileItems from 'Utilities/Object/reconcileItems';
import {
  QUALITY_FILTER_MAX_INDEX
} from 'Utilities/Quality/qualityFilterTiers';
import serverSideCollectionHandlers from 'Utilities/State/serverSideCollectionHandlers';
import { set } from './baseActions';
import createFetchServerSideCollectionHandler from './Creators/createFetchServerSideCollectionHandler';
import createHandleActions from './Creators/createHandleActions';
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
    maxIndex: 6
  },
  runtimeFilter: {
    minMinutes: 0,
    maxMinutes: null
  },
  maxEpisodeRuntime: 0,
  activeSeriesId: 0,
  cardSize: 200,
  sceneModalPanePercent: 50,
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
    items: []
  },
  sceneBookmarks: {
    seriesId: 0,
    isFetching: false,
    isPopulated: false,
    error: null,
    releaseDateAscending: [],
    releaseDateDescending: [],
    titleAscending: [],
    titleDescending: []
  }
};

export const defaultRuntimeFilter = defaultState.runtimeFilter;

export const SERIES_DETAILS_CARD_SIZE_MIN = 140;
export const SERIES_DETAILS_CARD_SIZE_MAX = 360;
export const SERIES_DETAILS_CARD_SIZE_STEP = 10;

export const persistState = [
  'seriesDetails.view',
  'seriesDetails.monitorStatusFilter',
  'seriesDetails.qualityFilter',
  'seriesDetails.runtimeFilter',
  'seriesDetails.cardSize',
  'seriesDetails.sceneModalPanePercent'
];

//
// Actions Types

export const SET_SERIES_DETAILS_VIEW = 'seriesDetails/setSeriesDetailsView';
export const SET_SERIES_DETAILS_MONITOR_STATUS_FILTER = 'seriesDetails/setSeriesDetailsMonitorStatusFilter';
export const SET_SERIES_DETAILS_QUALITY_FILTER = 'seriesDetails/setSeriesDetailsQualityFilter';
export const SET_SERIES_DETAILS_RUNTIME_FILTER = 'seriesDetails/setSeriesDetailsRuntimeFilter';
export const SET_SERIES_DETAILS_CARD_SIZE = 'seriesDetails/setSeriesDetailsCardSize';
export const SET_SERIES_DETAILS_ACTIVE_SERIES = 'seriesDetails/setSeriesDetailsActiveSeries';
export const FETCH_SERIES_DETAILS_FILTER_BOUNDS = 'seriesDetails/fetchSeriesDetailsFilterBounds';
export const FETCH_SERIES_DETAILS_UNIFIED_GRID = 'seriesDetails/fetchSeriesDetailsUnifiedGrid';
export const REFRESH_SERIES_DETAILS_UNIFIED_GRID = 'seriesDetails/refreshSeriesDetailsUnifiedGrid';
export const FETCH_MORE_SERIES_DETAILS_UNIFIED_GRID = 'seriesDetails/fetchMoreSeriesDetailsUnifiedGrid';
export const GOTO_FIRST_SERIES_DETAILS_UNIFIED_GRID_PAGE = 'seriesDetails/gotoFirstSeriesDetailsUnifiedGridPage';
export const CLEAR_SERIES_DETAILS_UNIFIED_GRID = 'seriesDetails/clearSeriesDetailsUnifiedGrid';
export const SET_SERIES_DETAILS_SORT = 'seriesDetails/setSeriesDetailsSort';
export const SYNC_SERIES_DETAILS_UNIFIED_GRID_SORT = 'seriesDetails/syncSeriesDetailsUnifiedGridSort';
export const FETCH_SERIES_SCENE_BOOKMARKS = 'seriesDetails/fetchSeriesSceneBookmarks';
export const TOGGLE_SERIES_SCENE_BOOKMARK = 'seriesDetails/toggleSeriesSceneBookmark';

//
// Action Creators

export const setSeriesDetailsView = createAction(SET_SERIES_DETAILS_VIEW);
export const setSeriesDetailsMonitorStatusFilter = createAction(SET_SERIES_DETAILS_MONITOR_STATUS_FILTER);
export const setSeriesDetailsQualityFilter = createAction(SET_SERIES_DETAILS_QUALITY_FILTER);
export const setSeriesDetailsRuntimeFilter = createAction(SET_SERIES_DETAILS_RUNTIME_FILTER);
export const setSeriesDetailsCardSize = createAction(SET_SERIES_DETAILS_CARD_SIZE);
export const setSeriesDetailsActiveSeries = createAction(SET_SERIES_DETAILS_ACTIVE_SERIES);
export const fetchSeriesDetailsFilterBounds = createThunk(FETCH_SERIES_DETAILS_FILTER_BOUNDS);
export const fetchSeriesDetailsUnifiedGrid = createThunk(FETCH_SERIES_DETAILS_UNIFIED_GRID);
export const refreshSeriesDetailsUnifiedGrid = createThunk(REFRESH_SERIES_DETAILS_UNIFIED_GRID);
export const fetchMoreSeriesDetailsUnifiedGrid = createThunk(FETCH_MORE_SERIES_DETAILS_UNIFIED_GRID);
export const gotoSeriesDetailsUnifiedGridFirstPage = createThunk(GOTO_FIRST_SERIES_DETAILS_UNIFIED_GRID_PAGE);
export const clearSeriesDetailsUnifiedGrid = createAction(CLEAR_SERIES_DETAILS_UNIFIED_GRID);
export const setSeriesDetailsSort = createThunk(SET_SERIES_DETAILS_SORT);
export const syncSeriesDetailsUnifiedGridSort = createThunk(SYNC_SERIES_DETAILS_UNIFIED_GRID_SORT);
export const fetchSeriesSceneBookmarks = createThunk(FETCH_SERIES_SCENE_BOOKMARKS);
export const toggleSeriesSceneBookmark = createThunk(TOGGLE_SERIES_SCENE_BOOKMARK);

function emptySceneBookmarks(seriesId = 0) {
  return {
    seriesId,
    isFetching: false,
    isPopulated: false,
    error: null,
    releaseDateAscending: [],
    releaseDateDescending: [],
    titleAscending: [],
    titleDescending: []
  };
}

function normalizeSceneBookmarks(seriesId, data) {
  return {
    seriesId,
    isFetching: false,
    isPopulated: true,
    error: null,
    releaseDateAscending: data.releaseDateAscending || [],
    releaseDateDescending: data.releaseDateDescending || [],
    titleAscending: data.titleAscending || [],
    titleDescending: data.titleDescending || []
  };
}

let sceneBookmarkFetchId = 0;
let sceneBookmarkRevision = 0;

export function toSeriesDetailsSortKey(sortKey) {
  if (sortKey === 'title' || sortKey === 'episodes.title') {
    return 'title';
  }

  if (
    sortKey === 'releaseDate' ||
    sortKey === 'episodes.releaseDate' ||
    sortKey === 'episodes.airDateUtc'
  ) {
    return 'releaseDate';
  }

  return sortKey;
}

export function getSceneBookmarkListKey(sortKey, sortDirection) {
  const normalized = toSeriesDetailsSortKey(sortKey);
  const field = normalized === 'title' ? 'title' : 'releaseDate';
  const direction = sortDirection === sortDirections.ASCENDING ? 'Ascending' : 'Descending';

  return `${field}${direction}`;
}

function toUnifiedGridSortKey(sortKey) {
  return sortKey === 'title' ? 'episodes.title' : 'episodes.releaseDate';
}

function applyEpisodeSortToUnifiedGrid(getState, dispatch) {
  const { sortKey, sortDirection } = getState().episodes;
  const usesEpisodeSort = sortKey === 'title' || sortKey === 'releaseDate';

  dispatch(set({
    section: 'seriesDetails.unifiedGrid',
    sortKey: toUnifiedGridSortKey(usesEpisodeSort ? sortKey : 'releaseDate'),
    sortDirection: usesEpisodeSort ? sortDirection : sortDirections.DESCENDING
  }));
}

function unifiedGridFetchDataAugmenter(getState, payload, data) {
  const {
    monitorStatusFilter,
    qualityFilter,
    runtimeFilter,
    maxEpisodeRuntime,
    activeSeriesId
  } = getState().seriesDetails;

  const seriesId = payload.seriesId || activeSeriesId;

  const resolvedQualityFilter = qualityFilter ?? {
    minIndex: 0,
    maxIndex: QUALITY_FILTER_MAX_INDEX
  };

  const resolvedRuntimeFilter = resolveRuntimeFilter(
    runtimeFilter ?? {
      minMinutes: 0,
      maxMinutes: null
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

let unifiedGridRefreshId = 0;

function nextUnifiedGridRefreshId() {
  unifiedGridRefreshId += 1;
  return unifiedGridRefreshId;
}

function processUnifiedGridFetchResponse(getState, payload, response, sectionState) {
  if (payload.refreshId != null && payload.refreshId !== unifiedGridRefreshId) {
    return { stale: true };
  }

  if (!response) {
    return { stale: false };
  }

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

  if (payload.reconcile) {
    const existingItems = getState().seriesDetails.unifiedGrid.items || [];

    data = {
      ...data,
      records: reconcileItems(existingItems, data.records || [])
    };
    extraSetState.pageSize = sectionState.pageSize;
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
      isFilterBoundsFetching: true
    }));

    const promise = createAjaxRequest({
      url: '/episode/filterBounds',
      data: {
        seriesId: payload.seriesId
      }
    }).request;

    promise.done((response) => {
      dispatch(set({
        section,
        maxEpisodeRuntime: response.maxEpisodeRuntime,
        isFilterBoundsFetching: false,
        isFilterBoundsPopulated: true,
        filterBoundsError: null
      }));
    });

    promise.fail((xhr) => {
      dispatch(set({
        section,
        isFilterBoundsFetching: false,
        isFilterBoundsPopulated: false,
        filterBoundsError: xhr
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
        [serverSideCollectionHandlers.FIRST_PAGE]: GOTO_FIRST_SERIES_DETAILS_UNIFIED_GRID_PAGE
      },
      unifiedGridFetchDataAugmenter
    );

    serverSideHandlers[FETCH_SERIES_DETAILS_UNIFIED_GRID] = function(getState, payload, dispatch) {
      unifiedGridFetchHandler(getState, {
        ...payload,
        refreshId: nextUnifiedGridRefreshId()
      }, dispatch);
    };

    return serverSideHandlers;
  })(),

  [REFRESH_SERIES_DETAILS_UNIFIED_GRID]: function(getState, payload, dispatch) {
    const unifiedGrid = getState().seriesDetails.unifiedGrid;
    const loadedCount = unifiedGrid.items?.length || 0;
    const pageSize = Math.max(
      loadedCount,
      unifiedGrid.totalRecords || 0,
      unifiedGrid.pageSize || 25
    );

    unifiedGridFetchHandler(getState, {
      seriesId: payload.seriesId,
      page: 1,
      pageSize,
      reconcile: true,
      refreshId: nextUnifiedGridRefreshId()
    }, dispatch);
  },

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
      refreshId: unifiedGridRefreshId
    }, dispatch);
  },

  [SET_SERIES_DETAILS_SORT]: function(getState, payload, dispatch) {
    const {
      sortKey: currentSortKey,
      sortDirection: currentSortDirection
    } = getState().episodes;

    const sortKey = payload.sortKey;
    let sortDirection = payload.sortDirection;

    if (!sortDirection) {
      if (sortKey === currentSortKey) {
        sortDirection = currentSortDirection === sortDirections.ASCENDING ?
          sortDirections.DESCENDING :
          sortDirections.ASCENDING;
      } else {
        sortDirection = currentSortDirection;
      }
    }

    dispatch({
      type: 'episodes/setEpisodesSort',
      payload: {
        sortKey,
        sortDirection
      }
    });

    applyEpisodeSortToUnifiedGrid(getState, dispatch);

    const { view, activeSeriesId } = getState().seriesDetails;
    const seriesId = payload.seriesId || activeSeriesId;

    if (view === 'unifiedGrid' && seriesId) {
      dispatch(clearSeriesDetailsUnifiedGrid());
      dispatch(gotoSeriesDetailsUnifiedGridFirstPage({ seriesId }));
    }
  },

  [SYNC_SERIES_DETAILS_UNIFIED_GRID_SORT]: function(getState, payload, dispatch) {
    applyEpisodeSortToUnifiedGrid(getState, dispatch);
  },

  [FETCH_SERIES_SCENE_BOOKMARKS]: function(getState, payload, dispatch) {
    const seriesId = payload.seriesId;
    sceneBookmarkFetchId += 1;
    const fetchId = sceneBookmarkFetchId;
    const revision = sceneBookmarkRevision;

    if (!seriesId) {
      dispatch(set({
        section,
        sceneBookmarks: emptySceneBookmarks()
      }));

      return;
    }

    const current = getState().seriesDetails.sceneBookmarks || emptySceneBookmarks();

    dispatch(set({
      section,
      sceneBookmarks: {
        ...(current.seriesId === seriesId ? current : emptySceneBookmarks(seriesId)),
        seriesId,
        isFetching: true,
        error: null
      }
    }));

    const promise = createAjaxRequest({
      url: `/series/${seriesId}/scenebookmark`
    }).request;

    promise.done((data) => {
      if (fetchId !== sceneBookmarkFetchId || revision !== sceneBookmarkRevision) {
        return;
      }

      dispatch(set({
        section,
        sceneBookmarks: normalizeSceneBookmarks(seriesId, data || {})
      }));
    });

    promise.fail((xhr) => {
      if (fetchId !== sceneBookmarkFetchId || revision !== sceneBookmarkRevision) {
        return;
      }

      const latest = getState().seriesDetails.sceneBookmarks || emptySceneBookmarks(seriesId);

      dispatch(set({
        section,
        sceneBookmarks: {
          ...(latest.seriesId === seriesId ? latest : emptySceneBookmarks(seriesId)),
          seriesId,
          isFetching: false,
          error: xhr
        }
      }));
    });
  },

  [TOGGLE_SERIES_SCENE_BOOKMARK]: function(getState, payload, dispatch) {
    const {
      seriesId,
      episodeId,
      sortKey,
      sortDirection
    } = payload;
    const listKey = getSceneBookmarkListKey(sortKey, sortDirection);
    const previous = getState().seriesDetails.sceneBookmarks || emptySceneBookmarks(seriesId);
    const current = previous[listKey] || [];
    const next = current.includes(episodeId) ?
      current.filter((id) => id !== episodeId) :
      current.concat(episodeId);

    sceneBookmarkRevision += 1;
    const revision = sceneBookmarkRevision;

    dispatch(set({
      section,
      sceneBookmarks: {
        ...previous,
        seriesId,
        isPopulated: true,
        error: null,
        [listKey]: next
      }
    }));

    const promise = createAjaxRequest({
      url: `/series/${seriesId}/scenebookmark`,
      method: 'POST',
      data: JSON.stringify({
        sortKey: toSeriesDetailsSortKey(sortKey),
        sortDirection,
        episodeId
      }),
      dataType: 'json'
    }).request;

    promise.done((data) => {
      if (revision !== sceneBookmarkRevision) {
        return;
      }

      if ((getState().seriesDetails.sceneBookmarks || {}).seriesId !== seriesId) {
        return;
      }

      dispatch(set({
        section,
        sceneBookmarks: normalizeSceneBookmarks(seriesId, data || {})
      }));
    });

    promise.fail(() => {
      if (revision !== sceneBookmarkRevision) {
        return;
      }

      if ((getState().seriesDetails.sceneBookmarks || {}).seriesId !== seriesId) {
        return;
      }

      dispatch(fetchSeriesSceneBookmarks({ seriesId }));
    });
  }
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

  [SET_SERIES_DETAILS_CARD_SIZE]: function(state, { payload }) {
    const cardSize = Math.min(
      SERIES_DETAILS_CARD_SIZE_MAX,
      Math.max(SERIES_DETAILS_CARD_SIZE_MIN, Math.round(payload.cardSize))
    );

    return Object.assign({}, state, { cardSize });
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
      page: 1
    }
  )

}, defaultState, section);
