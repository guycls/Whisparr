import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Card from 'Components/Card';
import FieldSet from 'Components/FieldSet';
import Icon from 'Components/Icon';
import PageSectionContent from 'Components/Page/PageSectionContent';
import { icons } from 'Helpers/Props';
import translate from 'Utilities/String/translate';
import AddNotificationModal from './AddNotificationModal';
import EditNotificationModalConnector from './EditNotificationModalConnector';
import Notification from './Notification';

class Notifications extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      isAddNotificationModalOpen: false,
      isEditNotificationModalOpen: false
    };
  }

  //
  // Listeners

  onAddNotificationPress = () => {
    this.setState({ isAddNotificationModalOpen: true });
  };

  onAddNotificationModalClose = ({ notificationSelected = false } = {}) => {
    this.setState({
      isAddNotificationModalOpen: false,
      isEditNotificationModalOpen: notificationSelected
    });
  };

  onEditNotificationModalClose = () => {
    this.setState({ isEditNotificationModalOpen: false });
  };

  //
  // Render

  render() {
    const {
      items,
      tagList,
      onConfirmDeleteNotification,
      ...otherProps
    } = this.props;

    const {
      isAddNotificationModalOpen,
      isEditNotificationModalOpen
    } = this.state;

    return (
      <FieldSet legend={translate('Connections')}>
        <PageSectionContent
          errorMessage={translate('NotificationsLoadError')}
          {...otherProps}
        >
          <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
            {
              items.map((item) => {
                return (
                  <Notification
                    key={item.id}
                    {...item}
                    tagList={tagList}
                    onConfirmDeleteNotification={onConfirmDeleteNotification}
                  />
                );
              })
            }

            <Box
              sx={(theme) => ({
                width: 290,
                m: theme.spacing(1.25)
              })}
            >
              <Card
                onPress={this.onAddNotificationPress}
              >
                <Box
                  sx={(theme) => ({
                    p: theme.spacing(1.25),
                    bgcolor: theme.palette.action.hover,
                    color: theme.palette.text.secondary,
                    textAlign: 'center'
                  })}
                >
                  <Box
                    sx={(theme) => ({
                      display: 'inline-block',
                      pt: theme.spacing(0.625),
                      px: theme.spacing(2.5),
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 1,
                      bgcolor: theme.palette.background.paper
                    })}
                  >
                    <Icon
                      name={icons.ADD}
                      size={45}
                    />
                  </Box>
                </Box>
              </Card>
            </Box>
          </Box>

          <AddNotificationModal
            isOpen={isAddNotificationModalOpen}
            onModalClose={this.onAddNotificationModalClose}
          />

          <EditNotificationModalConnector
            isOpen={isEditNotificationModalOpen}
            onModalClose={this.onEditNotificationModalClose}
          />
        </PageSectionContent>
      </FieldSet>
    );
  }
}

Notifications.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  error: PropTypes.object,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  tagList: PropTypes.arrayOf(PropTypes.object).isRequired,
  onConfirmDeleteNotification: PropTypes.func.isRequired
};

export default Notifications;
