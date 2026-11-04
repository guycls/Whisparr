import { batchActions } from 'redux-batched-actions';
import createAjaxRequest from 'Utilities/createAjaxRequest';
import reconcileItems from 'Utilities/Object/reconcileItems';
import getSectionState from 'Utilities/State/getSectionState';
import { set, update, updateItem } from '../baseActions';

export default function createFetchHandler(section, url) {
  return function(getState, payload, dispatch) {
    const {
      id,
      reconcile = false,
      refreshId,
      isCurrent,
      ...otherPayload
    } = payload;

    const isStale = () => {
      return refreshId != null && typeof isCurrent === 'function' && !isCurrent(refreshId);
    };

    if (isStale()) {
      return;
    }

    dispatch(set({ section, isFetching: true }));

    const { request, abortRequest } = createAjaxRequest({
      url: id == null ? url : `${url}/${id}`,
      data: otherPayload,
      traditional: true
    });

    request.done((data) => {
      if (isStale()) {
        return;
      }

      let nextData = data;

      if (reconcile && id == null && Array.isArray(data)) {
        const existingItems = getSectionState(getState(), section, true).items || [];
        nextData = reconcileItems(existingItems, data);
      }

      dispatch(batchActions([
        id == null ? update({ section, data: nextData }) : updateItem({ section, ...data }),

        set({
          section,
          isFetching: false,
          isPopulated: true,
          error: null
        })
      ]));
    });

    request.fail((xhr) => {
      if (isStale()) {
        return;
      }

      dispatch(set({
        section,
        isFetching: false,
        isPopulated: false,
        error: xhr.aborted ? null : xhr
      }));
    });

    return abortRequest;
  };
}
