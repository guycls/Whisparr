import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { syncFromStash } from 'Store/Actions/settingsActions';
import createSortedSectionSelector from 'Store/Selectors/createSortedSectionSelector';
import sortByProp from 'Utilities/Array/sortByProp';
import NotificationSettings from './NotificationSettings';

function createMapStateToProps() {
  return createSelector(
    createSortedSectionSelector('settings.notifications', sortByProp('name')),
    (notifications) => {
      const { items, isSyncingFromStash } = notifications;
      const hasStashConnection = items.some((item) => item.implementation === 'Stash');

      return {
        hasStashConnection,
        isSyncingFromStash
      };
    }
  );
}

const mapDispatchToProps = {
  dispatchSyncFromStash: syncFromStash
};

export default connect(createMapStateToProps, mapDispatchToProps)(NotificationSettings);
