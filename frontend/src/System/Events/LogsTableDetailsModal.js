import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React from 'react';
import Button from 'Components/Link/Button';
import Modal from 'Components/Modal/Modal';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import Scroller from 'Components/Scroller/Scroller';
import { scrollDirections } from 'Helpers/Props';
import translate from 'Utilities/String/translate';

function LogsTableDetailsModal(props) {
  const {
    isOpen,
    message,
    exception,
    onModalClose
  } = props;

  return (
    <Modal
      isOpen={isOpen}
      onModalClose={onModalClose}
    >
      <ModalContent
        onModalClose={onModalClose}
      >
        <ModalHeader>
          {translate('Details')}
        </ModalHeader>

        <ModalBody>
          <div>
            {translate('Message')}
          </div>

          <Box
            component={Scroller}
            scrollDirection={scrollDirections.HORIZONTAL}
            sx={{
              display: 'block',
              mb: '10.5px',
              p: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: 'var(--logEventsBackgroundColor)',
              color: 'var(--textColor)',
              whiteSpace: 'pre',
              overflowWrap: 'break-word',
              wordBreak: 'break-all',
              fontSize: 13,
              fontFamily: '"Ubuntu Mono", Menlo, Monaco, Consolas, "Courier New", monospace',
              lineHeight: 1.52857143
            }}
          >
            {message}
          </Box>

          {
            !!exception &&
              <div>
                <div>
                  {translate('Exception')}
                </div>
                <Box
                  component={Scroller}
                  scrollDirection={scrollDirections.HORIZONTAL}
                  sx={{
                    display: 'block',
                    mb: '10.5px',
                    p: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    backgroundColor: 'var(--logEventsBackgroundColor)',
                    color: 'var(--textColor)',
                    whiteSpace: 'pre',
                    overflowWrap: 'break-word',
                    wordBreak: 'break-all',
                    fontSize: 13,
                    fontFamily: '"Ubuntu Mono", Menlo, Monaco, Consolas, "Courier New", monospace',
                    lineHeight: 1.52857143
                  }}
                >
                  {exception}
                </Box>
              </div>
          }
        </ModalBody>

        <ModalFooter>
          <Button onPress={onModalClose}>
            {translate('Close')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

LogsTableDetailsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
  exception: PropTypes.string,
  onModalClose: PropTypes.func.isRequired
};

export default LogsTableDetailsModal;
