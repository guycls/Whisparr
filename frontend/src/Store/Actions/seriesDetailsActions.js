import { createAction } from 'redux-actions';
import createHandleActions from './Creators/createHandleActions';

//
// Variables

export const section = 'seriesDetails';

//
// State

export const defaultState = {
  view: 'list'
};

export const persistState = [
  'seriesDetails.view'
];

//
// Actions Types

export const SET_SERIES_DETAILS_VIEW = 'seriesDetails/setSeriesDetailsView';

//
// Action Creators

export const setSeriesDetailsView = createAction(SET_SERIES_DETAILS_VIEW);

//
// Reducers

export const reducers = createHandleActions({

  [SET_SERIES_DETAILS_VIEW]: function(state, { payload }) {
    return Object.assign({}, state, { view: payload.view });
  }

}, defaultState, section);
