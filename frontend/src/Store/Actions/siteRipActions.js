import { createAction } from 'redux-actions';
import { batchActions } from 'redux-batched-actions';
import { sortDirections } from 'Helpers/Props';
import { createThunk, handleThunks } from 'Store/thunks';
import createAjaxRequest from 'Utilities/createAjaxRequest';
import { set, update } from './baseActions';
import createHandleActions from './Creators/createHandleActions';
import createSetClientSideCollectionSortReducer from './Creators/Reducers/createSetClientSideCollectionSortReducer';

//
// Variables

export const section = 'siteRip';

let abortCurrentRequest = null;
let progressPollInterval = null;
let matchProgressPollTimeout = null;
let matchProgressPollCancelled = false;

function generateSearchId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function generateMatchId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function stopProgressPolling(dispatch) {
  if (progressPollInterval) {
    clearInterval(progressPollInterval);
    progressPollInterval = null;
  }

  dispatch(set({
    section,
    searchStatusMessage: null,
    searchId: null
  }));
}

function startProgressPolling(searchId, dispatch) {
  if (progressPollInterval) {
    clearInterval(progressPollInterval);
    progressPollInterval = null;
  }

  const poll = () => {
    createAjaxRequest({
      url: `/siterip/search/progress/${searchId}`
    }).request.done((data) => {
      if (data.message) {
        dispatch(set({
          section,
          searchStatusMessage: data.message,
          searchId
        }));
      }
    });
  };

  poll();
  progressPollInterval = setInterval(poll, 500);
}

function cancelMatchProgressPolling() {
  matchProgressPollCancelled = true;

  if (matchProgressPollTimeout) {
    clearTimeout(matchProgressPollTimeout);
    matchProgressPollTimeout = null;
  }
}

function stopMatchProgressPolling(dispatch, clearState = true) {
  cancelMatchProgressPolling();

  if (!clearState) {
    return;
  }

  dispatch(set({
    section,
    matchStatusMessage: null,
    matchPhase: null,
    matchCompletedFiles: 0,
    matchTotalFiles: 0,
    matchId: null
  }));
}

function startMatchProgressPolling(matchId, dispatch) {
  cancelMatchProgressPolling();
  matchProgressPollCancelled = false;

  const schedulePoll = () => {
    if (matchProgressPollCancelled) {
      return;
    }

    matchProgressPollTimeout = setTimeout(poll, 500);
  };

  const poll = () => {
    if (matchProgressPollCancelled) {
      return;
    }

    createAjaxRequest({
      url: `/siterip/match/progress/${matchId}`
    }).request.done((data) => {
      if (matchProgressPollCancelled) {
        return;
      }

      if (data.error) {
        stopMatchProgressPolling(dispatch);

        dispatch(set({
          section,
          isMatching: false,
          isFilesFetching: false,
          matchError: data.error
        }));

        return;
      }

      dispatch(set({
        section,
        matchStatusMessage: data.message,
        matchPhase: data.phase,
        matchCompletedFiles: data.completedFiles || 0,
        matchTotalFiles: data.totalFiles || 0,
        matchId
      }));

      if (data.isComplete) {
        stopMatchProgressPolling(dispatch);

        const matches = data.matches || [];
        const selections = {};

        matches.forEach((match, index) => {
          selections[index] = {
            selected: match.selectedByDefault,
            episodeId: match.matchedEpisodeId
          };
        });

        dispatch(set({
          section,
          isMatching: false,
          isFilesFetching: false,
          matches,
          torrentFiles: data.torrentFiles || [],
          selections,
          matchError: null
        }));

        return;
      }

      schedulePoll();
    }).fail((xhr) => {
      if (matchProgressPollCancelled) {
        return;
      }

      if (xhr.status === 404 || xhr.status === 0) {
        schedulePoll();
        return;
      }

      stopMatchProgressPolling(dispatch);

      dispatch(set({
        section,
        isMatching: false,
        isFilesFetching: false,
        matchError: xhr.responseJSON && xhr.responseJSON.message || xhr
      }));
    });
  };

  poll();
}

//
// State

export const defaultState = {
  isFetching: false,
  isPopulated: false,
  error: null,
  items: [],
  searchStatusMessage: null,
  searchId: null,
  sortKey: 'releaseWeight',
  sortDirection: sortDirections.ASCENDING,
  sortPredicates: {
    age: function(item) {
      return item.ageMinutes;
    },

    peers: function(item) {
      const seeders = item.seeders || 0;
      const leechers = item.leechers || 0;

      return seeders * 1000000 + leechers;
    },

    rejections: function(item) {
      const rejections = item.rejections;
      const releaseWeight = item.releaseWeight;

      if (rejections.length !== 0) {
        return releaseWeight + 1000000;
      }

      return releaseWeight;
    },

    releaseWeight: function(item) {
      const rejections = item.rejections;
      const releaseWeight = item.releaseWeight;

      if (rejections.length === 0) {
        return releaseWeight;
      }

      return releaseWeight + 1000000;
    }
  },
  view: 'search',
  selectedRelease: null,
  torrentFiles: [],
  isFilesFetching: false,
  filesError: null,
  matches: [],
  isMatching: false,
  matchError: null,
  matchId: null,
  matchStatusMessage: null,
  matchPhase: null,
  matchCompletedFiles: 0,
  matchTotalFiles: 0,
  selections: {},
  isGrabbing: false,
  isGrabbed: false,
  grabError: null
};

//
// Actions Types

export const FETCH_SITE_RIP_RELEASES = 'siteRip/fetchSiteRipReleases';
export const CANCEL_FETCH_SITE_RIP_RELEASES = 'siteRip/cancelFetchSiteRipReleases';
export const CLEAR_SITE_RIP = 'siteRip/clearSiteRip';
export const SET_SITE_RIP_VIEW = 'siteRip/setSiteRipView';
export const SET_SITE_RIP_RELEASE = 'siteRip/setSiteRipRelease';
export const FETCH_TORRENT_FILES = 'siteRip/fetchTorrentFiles';
export const MATCH_SITE_RIP_FILES = 'siteRip/matchSiteRipFiles';
export const START_SITE_RIP_MATCHING = 'siteRip/startSiteRipMatching';
export const SET_SITE_RIP_SELECTION = 'siteRip/setSiteRipSelection';
export const SET_SITE_RIP_EPISODE = 'siteRip/setSiteRipEpisode';
export const SET_SITE_RIP_SORT = 'siteRip/setSiteRipSort';
export const GRAB_SITE_RIP = 'siteRip/grabSiteRip';

//
// Action Creators

export const fetchSiteRipReleases = createThunk(FETCH_SITE_RIP_RELEASES);
export const cancelFetchSiteRipReleases = createThunk(CANCEL_FETCH_SITE_RIP_RELEASES);
export const clearSiteRip = createThunk(CLEAR_SITE_RIP);
export const setSiteRipView = createAction(SET_SITE_RIP_VIEW);
export const setSiteRipRelease = createAction(SET_SITE_RIP_RELEASE);
export const fetchTorrentFiles = createThunk(FETCH_TORRENT_FILES);
export const matchSiteRipFiles = createThunk(MATCH_SITE_RIP_FILES);
export const startSiteRipMatching = createThunk(START_SITE_RIP_MATCHING);
export const setSiteRipSelection = createAction(SET_SITE_RIP_SELECTION);
export const setSiteRipEpisode = createAction(SET_SITE_RIP_EPISODE);
export const setSiteRipSort = createAction(SET_SITE_RIP_SORT);
export const grabSiteRip = createThunk(GRAB_SITE_RIP);

//
// Action Handlers

export const actionHandlers = handleThunks({

  [FETCH_SITE_RIP_RELEASES]: function(getState, payload, dispatch) {
    const searchId = generateSearchId();

    dispatch(set({
      section,
      isFetching: true,
      searchStatusMessage: null,
      searchId
    }));

    startProgressPolling(searchId, dispatch);

    const { request, abortRequest } = createAjaxRequest({
      url: '/siterip/search',
      data: {
        ...payload,
        searchId
      },
      traditional: true
    });

    request.done((data) => {
      stopProgressPolling(dispatch);

      dispatch(batchActions([
        update({ section, data }),
        set({
          section,
          isFetching: false,
          isPopulated: true,
          error: null
        })
      ]));
    });

    request.fail((xhr) => {
      stopProgressPolling(dispatch);

      dispatch(set({
        section,
        isFetching: false,
        isPopulated: false,
        error: xhr.aborted ? null : xhr
      }));
    });

    abortCurrentRequest = abortRequest;
  },

  [CANCEL_FETCH_SITE_RIP_RELEASES]: function(getState, payload, dispatch) {
    stopProgressPolling(dispatch);
    stopMatchProgressPolling(dispatch);

    if (abortCurrentRequest) {
      abortCurrentRequest();
    }
  },

  [CLEAR_SITE_RIP]: function(getState, payload, dispatch) {
    stopMatchProgressPolling(dispatch);

    dispatch(set({
      section,
      ...defaultState
    }));
  },

  [FETCH_TORRENT_FILES]: function(getState, payload, dispatch) {
    dispatch(set({
      section,
      isFilesFetching: true,
      filesError: null,
      torrentFiles: [],
      matches: [],
      selections: {}
    }));

    const { request } = createAjaxRequest({
      url: '/siterip/torrent/files',
      data: payload,
      traditional: true
    });

    request.done((data) => {
      dispatch(set({
        section,
        isFilesFetching: false,
        torrentFiles: data
      }));

      dispatch(matchSiteRipFiles({
        seriesId: payload.seriesId,
        files: data
      }));
    });

    request.fail((xhr) => {
      dispatch(set({
        section,
        isFilesFetching: false,
        filesError: xhr.responseJSON && xhr.responseJSON.message || xhr
      }));
    });
  },

  [MATCH_SITE_RIP_FILES]: function(getState, payload, dispatch) {
    dispatch(set({
      section,
      isMatching: true,
      matchError: null
    }));

    const promise = createAjaxRequest({
      url: '/siterip/match',
      method: 'POST',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify(payload)
    }).request;

    promise.done((data) => {
      const selections = {};

      data.forEach((match, index) => {
        selections[index] = {
          selected: match.selectedByDefault,
          episodeId: match.matchedEpisodeId
        };
      });

      dispatch(set({
        section,
        isMatching: false,
        matches: data,
        selections
      }));
    });

    promise.fail((xhr) => {
      dispatch(set({
        section,
        isMatching: false,
        matchError: xhr.responseJSON && xhr.responseJSON.message || xhr
      }));
    });
  },

  [START_SITE_RIP_MATCHING]: function(getState, payload, dispatch) {
    const matchId = generateMatchId();

    cancelMatchProgressPolling();

    dispatch(set({
      section,
      isMatching: true,
      isFilesFetching: true,
      filesError: null,
      matchError: null,
      torrentFiles: [],
      matches: [],
      selections: {},
      matchStatusMessage: null,
      matchPhase: 'starting',
      matchCompletedFiles: 0,
      matchTotalFiles: 0,
      matchId
    }));

    startMatchProgressPolling(matchId, dispatch);

    const promise = createAjaxRequest({
      url: '/siterip/match/start',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        matchId,
        seriesId: payload.seriesId,
        guid: payload.guid,
        indexerId: payload.indexerId
      })
    }).request;

    promise.fail((xhr) => {
      if (xhr.status >= 200 && xhr.status < 300) {
        return;
      }

      stopMatchProgressPolling(dispatch);

      dispatch(set({
        section,
        isMatching: false,
        isFilesFetching: false,
        matchError: xhr.responseJSON && xhr.responseJSON.message || xhr
      }));
    });
  },

  [GRAB_SITE_RIP]: function(getState, payload, dispatch) {
    dispatch(set({
      section,
      isGrabbing: true,
      grabError: null
    }));

    const promise = createAjaxRequest({
      url: '/siterip/grab',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(payload)
    }).request;

    promise.done(() => {
      dispatch(set({
        section,
        isGrabbing: false,
        isGrabbed: true,
        grabError: null
      }));
    });

    promise.fail((xhr) => {
      dispatch(set({
        section,
        isGrabbing: false,
        isGrabbed: false,
        grabError: xhr.responseJSON && xhr.responseJSON.message || 'Failed to add to download queue'
      }));
    });
  }
});

//
// Reducers

export const reducers = createHandleActions({

  [SET_SITE_RIP_VIEW]: (state, { payload }) => {
    return Object.assign({}, state, {
      view: payload
    });
  },

  [SET_SITE_RIP_RELEASE]: (state, { payload }) => {
    return Object.assign({}, state, {
      selectedRelease: payload,
      view: 'matching'
    });
  },

  [SET_SITE_RIP_SELECTION]: (state, { payload }) => {
    const { index, selected } = payload;
    const selections = { ...state.selections };

    selections[index] = {
      ...selections[index],
      selected
    };

    return Object.assign({}, state, { selections });
  },

  [SET_SITE_RIP_EPISODE]: (state, { payload }) => {
    const { index, episodeId } = payload;
    const selections = { ...state.selections };

    selections[index] = {
      ...selections[index],
      episodeId
    };

    return Object.assign({}, state, { selections });
  },

  [SET_SITE_RIP_SORT]: createSetClientSideCollectionSortReducer(section)

}, defaultState, section);
