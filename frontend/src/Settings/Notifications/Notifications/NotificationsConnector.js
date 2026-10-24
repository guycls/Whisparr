import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { fetchRootFolders } from 'Store/Actions/rootFolderActions';
import { deleteNotification, fetchNotifications } from 'Store/Actions/settingsActions';
import createSortedSectionSelector from 'Store/Selectors/createSortedSectionSelector';
import createTagsSelector from 'Store/Selectors/createTagsSelector';
import sortByProp from 'Utilities/Array/sortByProp';
import Notifications from './Notifications';

function createMapStateToProps() {
  return createSelector(
    createSortedSectionSelector('settings.notifications', sortByProp('name')),
    createTagsSelector(),
    (notifications, tagList) => {
      return {
        ...notifications,
        tagList
      };
    }
  );
}

const mapDispatchToProps = {
  fetchNotifications,
  deleteNotification,
  fetchRootFolders
};

class NotificationsConnector extends Component {

  //
  // Lifecycle

  componentDidMount() {
    this.props.fetchNotifications();
    this.props.fetchRootFolders();
  }

  //
  // Listeners

  onConfirmDeleteNotification = (id) => {
    this.props.deleteNotification({ id });
  };

  //
  // Render

  render() {
    return (
      <Notifications
        {...this.props}
        onConfirmDeleteNotification={this.onConfirmDeleteNotification}
      />
    );
  }
}

NotificationsConnector.propTypes = {
  fetchNotifications: PropTypes.func.isRequired,
  deleteNotification: PropTypes.func.isRequired,
  fetchRootFolders: PropTypes.func.isRequired
};

export default connect(createMapStateToProps, mapDispatchToProps)(NotificationsConnector);
