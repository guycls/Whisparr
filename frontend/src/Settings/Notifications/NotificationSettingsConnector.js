import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { fullImportFromStash } from 'Store/Actions/settingsActions';
import createSortedSectionSelector from 'Store/Selectors/createSortedSectionSelector';
import sortByProp from 'Utilities/Array/sortByProp';
import NotificationSettings from './NotificationSettings';

function createMapStateToProps() {
  return createSelector(
    createSortedSectionSelector('settings.notifications', sortByProp('name')),
    (notifications) => {
      const { items, isFullImportingFromStash } = notifications;
      const hasStashConnection = items.some((item) => item.implementation === 'Stash');

      return {
        hasStashConnection,
        isFullImportingFromStash
      };
    }
  );
}

const mapDispatchToProps = {
  dispatchFullImportFromStash: fullImportFromStash
};

export default connect(createMapStateToProps, mapDispatchToProps)(NotificationSettings);
