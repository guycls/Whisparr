import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { cancelCommand } from 'Store/Actions/commandActions';
import createUISettingsSelector from 'Store/Selectors/createUISettingsSelector';
import QueuedTaskRow from './QueuedTaskRow';

function createMapStateToProps() {
  return createSelector(
    createUISettingsSelector(),
    (uiSettings) => {
      return {
        showRelativeDates: uiSettings.showRelativeDates,
        shortDateFormat: uiSettings.shortDateFormat,
        longDateFormat: uiSettings.longDateFormat,
        timeFormat: uiSettings.timeFormat
      };
    }
  );
}

function createMapDispatchToProps(dispatch, props) {
  return {
    onCancelPress() {
      return dispatch(cancelCommand({
        id: props.id,
        status: props.status
      }));
    }
  };
}

export default connect(createMapStateToProps, createMapDispatchToProps)(QueuedTaskRow);
