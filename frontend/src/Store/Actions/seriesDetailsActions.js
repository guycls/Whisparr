import { createAction } from 'redux-actions';
import createHandleActions from './Creators/createHandleActions';

//
// Variables

export const section = 'seriesDetails';

//
// State

export const defaultState = {
  view: 'list',
  monitorStatusFilter: 'all',
  qualityFilter: {
    minIndex: 0,
    maxIndex: 6
  }
};

export const persistState = [
  'seriesDetails.view',
  'seriesDetails.monitorStatusFilter',
  'seriesDetails.qualityFilter'
];

//
// Actions Types

export const SET_SERIES_DETAILS_VIEW = 'seriesDetails/setSeriesDetailsView';
export const SET_SERIES_DETAILS_MONITOR_STATUS_FILTER = 'seriesDetails/setSeriesDetailsMonitorStatusFilter';
export const SET_SERIES_DETAILS_QUALITY_FILTER = 'seriesDetails/setSeriesDetailsQualityFilter';

//
// Action Creators

export const setSeriesDetailsView = createAction(SET_SERIES_DETAILS_VIEW);
export const setSeriesDetailsMonitorStatusFilter = createAction(SET_SERIES_DETAILS_MONITOR_STATUS_FILTER);
export const setSeriesDetailsQualityFilter = createAction(SET_SERIES_DETAILS_QUALITY_FILTER);

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
  }

}, defaultState, section);
