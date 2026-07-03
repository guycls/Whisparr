import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { clearPendingChanges } from 'Store/Actions/baseActions';
import {
  fetchMetadataSourceSettings,
  saveMetadataSourceSettings,
  setMetadataSourceSettingsValue
} from 'Store/Actions/settingsActions';
import createSettingsSectionSelector from 'Store/Selectors/createSettingsSectionSelector';
import MetadataSourceSettings from './MetadataSourceSettings';

const SECTION = 'metadataSource';

function createMapStateToProps() {
  return createSelector(
    createSettingsSectionSelector(SECTION),
    (sectionSettings) => {
      return {
        ...sectionSettings
      };
    }
  );
}

const mapDispatchToProps = {
  dispatchSetMetadataSourceSettingsValue: setMetadataSourceSettingsValue,
  dispatchSaveMetadataSourceSettings: saveMetadataSourceSettings,
  dispatchFetchMetadataSourceSettings: fetchMetadataSourceSettings,
  dispatchClearPendingChanges: clearPendingChanges
};

class MetadataSourceSettingsConnector extends Component {

  //
  // Lifecycle

  componentDidMount() {
    this.props.dispatchFetchMetadataSourceSettings();
  }

  componentWillUnmount() {
    this.props.dispatchClearPendingChanges({ section: `settings.${SECTION}` });
  }

  //
  // Listeners

  onInputChange = ({ name, value }) => {
    this.props.dispatchSetMetadataSourceSettingsValue({ name, value });
  };

  onClearTpdbApiKeyPress = () => {
    this.props.dispatchSetMetadataSourceSettingsValue({ name: 'clearTpdbApiKey', value: true });
    this.props.dispatchSetMetadataSourceSettingsValue({ name: 'tpdbApiKey', value: '' });
  };

  onSavePress = () => {
    this.props.dispatchSaveMetadataSourceSettings();
  };

  //
  // Render

  render() {
    return (
      <MetadataSourceSettings
        onInputChange={this.onInputChange}
        onClearTpdbApiKeyPress={this.onClearTpdbApiKeyPress}
        onSavePress={this.onSavePress}
        {...this.props}
      />
    );
  }
}

MetadataSourceSettingsConnector.propTypes = {
  dispatchSetMetadataSourceSettingsValue: PropTypes.func.isRequired,
  dispatchSaveMetadataSourceSettings: PropTypes.func.isRequired,
  dispatchFetchMetadataSourceSettings: PropTypes.func.isRequired,
  dispatchClearPendingChanges: PropTypes.func.isRequired
};

export default connect(createMapStateToProps, mapDispatchToProps)(MetadataSourceSettingsConnector);
