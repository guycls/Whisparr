import _ from 'lodash';
import { handleActions } from 'redux-actions';
import {
  CLEAR_PENDING_CHANGES,
  REMOVE_ITEM,
  SET,
  UPDATE,
  UPDATE_ITEM,
  UPDATE_SERVER_SIDE_COLLECTION } from 'Store/Actions/baseActions';
import getSectionState from 'Utilities/State/getSectionState';
import updateSectionState from 'Utilities/State/updateSectionState';

const omittedProperties = [
  'section',
  'id'
];

function createItemMap(data) {
  return data.reduce((acc, d, index) => {
    acc[d.id] = index;
    return acc;
  }, {});
}

function patchUnifiedGridWindow(newState, id, otherProps) {
  let changed = false;

  if (newState.windowPages) {
    const nextPages = {};

    Object.keys(newState.windowPages).forEach((page) => {
      const records = newState.windowPages[page] || [];
      const recordIndex = records.findIndex((record) => record.id === id);

      if (recordIndex === -1) {
        nextPages[page] = records;
        return;
      }

      const record = records[recordIndex];
      const nextRecord = { ...record, ...otherProps };

      if (_.isEqual(record, nextRecord)) {
        nextPages[page] = records;
        return;
      }

      changed = true;
      const nextRecords = records.slice();
      nextRecords[recordIndex] = nextRecord;
      nextPages[page] = nextRecords;
    });

    if (changed) {
      newState.windowPages = nextPages;
    }
  }

  if (Array.isArray(newState.sceneOrder)) {
    const orderIndex = newState.sceneOrder.findIndex((record) => record.id === id);

    if (orderIndex >= 0) {
      const record = newState.sceneOrder[orderIndex];
      const nextRecord = { ...record };

      if (otherProps.monitored != null) {
        nextRecord.monitored = otherProps.monitored;
      }

      if (otherProps.episodeFileId != null) {
        nextRecord.episodeFileId = otherProps.episodeFileId;
      }

      if (otherProps.title != null) {
        nextRecord.title = otherProps.title;
      }

      if (!_.isEqual(record, nextRecord)) {
        const sceneOrder = newState.sceneOrder.slice();
        sceneOrder[orderIndex] = nextRecord;
        newState.sceneOrder = sceneOrder;
        changed = true;
      }
    }
  }

  return changed;
}

export default function createHandleActions(handlers, defaultState, section) {
  return handleActions({

    [SET]: function(state, { payload }) {
      const payloadSection = payload.section;
      const [baseSection] = payloadSection.split('.');

      if (section === baseSection) {
        const newState = Object.assign(getSectionState(state, payloadSection),
          _.omit(payload, omittedProperties));

        return updateSectionState(state, payloadSection, newState);
      }

      return state;
    },

    [UPDATE]: function(state, { payload }) {
      const payloadSection = payload.section;
      const [baseSection] = payloadSection.split('.');

      if (section === baseSection) {
        const newState = getSectionState(state, payloadSection);

        if (_.isArray(payload.data)) {
          newState.items = payload.data;
          newState.itemMap = createItemMap(payload.data);
        } else {
          newState.item = payload.data;
        }

        return updateSectionState(state, payloadSection, newState);
      }

      return state;
    },

    [UPDATE_ITEM]: function(state, { payload }) {
      const {
        section: payloadSection,
        updateOnly = false,
        ...otherProps
      } = payload;

      const [baseSection] = payloadSection.split('.');

      if (section === baseSection) {
        const newState = getSectionState(state, payloadSection);
        const items = newState.items;

        // Client side collections that are created by adding items to an
        // existing array may not have an itemMap, the array is probably empty,
        // but on the offchance it's not create a new item map based on the
        // items in the array.
        const itemMap = newState.itemMap ?? createItemMap(items || []);
        const index = payload.id in itemMap ? itemMap[payload.id] : -1;
        let itemsChanged = false;

        // TODO: Move adding to it's own reducer
        if (index >= 0) {
          const item = items[index];
          const newItem = { ...item, ...otherProps };

          // if the item to update is equal to existing, then don't actually update
          // to prevent costly reselections
          if (!_.isEqual(item, newItem)) {
            newState.items = [...items];
            newState.items.splice(index, 1, newItem);
            itemsChanged = true;
          }
        } else if (!updateOnly) {
          newState.items = [...(items || []), { ...otherProps }];
          newState.itemMap = { ...itemMap };
          newState.itemMap[payload.id] = newState.items.length - 1;
          itemsChanged = true;
        }

        const windowChanged = patchUnifiedGridWindow(newState, payload.id, otherProps);

        if (!itemsChanged && !windowChanged) {
          return state;
        }

        return updateSectionState(state, payloadSection, newState);
      }

      return state;
    },

    [CLEAR_PENDING_CHANGES]: function(state, { payload }) {
      const payloadSection = payload.section;
      const [baseSection] = payloadSection.split('.');

      if (section === baseSection) {
        const newState = getSectionState(state, payloadSection);
        newState.pendingChanges = {};

        if (newState.hasOwnProperty('saveError')) {
          newState.saveError = null;
        }

        return updateSectionState(state, payloadSection, newState);
      }

      return state;
    },

    [REMOVE_ITEM]: function(state, { payload }) {
      const payloadSection = payload.section;
      const [baseSection] = payloadSection.split('.');

      if (section === baseSection) {
        const newState = getSectionState(state, payloadSection);

        newState.items = [...newState.items];
        _.remove(newState.items, { id: payload.id });

        newState.itemMap = createItemMap(newState.items);

        return updateSectionState(state, payloadSection, newState);
      }

      return state;
    },

    [UPDATE_SERVER_SIDE_COLLECTION]: function(state, { payload }) {
      const payloadSection = payload.section;
      const [baseSection] = payloadSection.split('.');

      if (section === baseSection) {
        const data = payload.data;
        const append = payload.append === true;
        const newState = getSectionState(state, payloadSection);

        const serverState = _.omit(data, ['records']);
        let items = data.records;

        if (append) {
          const existingItems = newState.items || [];
          const existingIds = new Set(existingItems.map(({ id }) => id));

          items = [
            ...existingItems,
            ...data.records.filter(({ id }) => !existingIds.has(id))
          ];
        }

        const calculatedState = {
          totalPages: Math.max(Math.ceil(data.totalRecords / data.pageSize), 1),
          items,
          itemMap: createItemMap(items)
        };

        return updateSectionState(state, payloadSection, Object.assign(newState, serverState, calculatedState));
      }

      return state;
    },

    ...handlers

  }, defaultState);
}
