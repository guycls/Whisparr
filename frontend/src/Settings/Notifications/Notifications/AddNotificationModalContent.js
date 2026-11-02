import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Button from 'Components/Link/Button';
import LoadingIndicator from 'Components/Loading/LoadingIndicator';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import translate from 'Utilities/String/translate';
import AddNotificationItem from './AddNotificationItem';

const sxNotifications = {
  display: 'flex',
  justifyContent: 'center',
  flexWrap: 'wrap'
};

class AddNotificationModalContent extends Component {

  //
  // Render

  render() {
    const {
      isSchemaFetching,
      isSchemaPopulated,
      schemaError,
      schema,
      onNotificationSelect,
      onModalClose
    } = this.props;

    return (
      <ModalContent onModalClose={onModalClose}>
        <ModalHeader>
          {translate('AddConnection')}
        </ModalHeader>

        <ModalBody>
          {
            isSchemaFetching &&
              <LoadingIndicator />
          }

          {
            !isSchemaFetching && !!schemaError &&
              <div>
                {translate('AddNotificationError')}
              </div>
          }

          {
            isSchemaPopulated && !schemaError &&
              <div>
                <Box sx={sxNotifications}>
                  {
                    schema.map((notification) => {
                      return (
                        <AddNotificationItem
                          key={notification.implementation}
                          implementation={notification.implementation}
                          {...notification}
                          onNotificationSelect={onNotificationSelect}
                        />
                      );
                    })
                  }
                </Box>
              </div>
          }
        </ModalBody>
        <ModalFooter>
          <Button
            onPress={onModalClose}
          >
            {translate('Close')}
          </Button>
        </ModalFooter>
      </ModalContent>
    );
  }
}

AddNotificationModalContent.propTypes = {
  isSchemaFetching: PropTypes.bool.isRequired,
  isSchemaPopulated: PropTypes.bool.isRequired,
  schemaError: PropTypes.object,
  schema: PropTypes.arrayOf(PropTypes.object).isRequired,
  onNotificationSelect: PropTypes.func.isRequired,
  onModalClose: PropTypes.func.isRequired
};

export default AddNotificationModalContent;
