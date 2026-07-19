import _ from 'lodash';
import { batchActions } from 'redux-batched-actions';
import createAjaxRequest from 'Utilities/createAjaxRequest';
import findSelectedFilters from 'Utilities/Filter/findSelectedFilters';
import getSectionState from 'Utilities/State/getSectionState';
import { set, updateServerSideCollection } from '../baseActions';

function createFetchServerSideCollectionHandler(section, url, fetchDataAugmenter, processFetchResponse) {
  const [baseSection] = section.split('.');

  return function(getState, payload, dispatch) {
    const sectionState = getSectionState(getState(), section, true);
    const page = payload.page || sectionState.page || 1;
    const fetchState = { isFetching: true };

    if (processFetchResponse && page === 1 && payload.append !== true) {
      fetchState.lastPageSize = 0;
    }

    dispatch(set({ section, ...fetchState }));

    const data = Object.assign({ page },
      _.pick(sectionState, [
        'pageSize',
        'sortDirection',
        'sortKey'
      ]));

    if (fetchDataAugmenter) {
      fetchDataAugmenter(getState, payload, data);
    }

    const {
      selectedFilterKey,
      filters
    } = sectionState;

    const customFilters = getState().customFilters.items.filter((customFilter) => {
      return customFilter.type === section || customFilter.type === baseSection;
    });

    const selectedFilters = findSelectedFilters(selectedFilterKey, filters, customFilters);

    selectedFilters.forEach((filter) => {
      data[filter.key] = filter.value;
    });

    const promise = createAjaxRequest({
      url,
      data,
      traditional: true
    }).request;

    promise.done((response) => {
      let responseData = response;
      let extraSetState = {};

      if (processFetchResponse) {
        const processed = processFetchResponse(getState, payload, response, sectionState);
        responseData = processed.data;
        extraSetState = processed.extraSetState || {};
      }

      dispatch(batchActions([
        updateServerSideCollection({
          section,
          data: responseData,
          append: payload.append === true
        }),

        set({
          section,
          isFetching: false,
          isPopulated: true,
          error: null,
          ...extraSetState
        })
      ]));
    });

    promise.fail((xhr) => {
      dispatch(set({
        section,
        isFetching: false,
        isPopulated: false,
        error: xhr
      }));
    });
  };
}

export default createFetchServerSideCollectionHandler;
