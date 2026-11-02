import Box from '@mui/material/Box';
import React, { useCallback } from 'react';
import Button from 'Components/Link/Button';
import Modal from 'Components/Modal/Modal';
import ModalBody from 'Components/Modal/ModalBody';
import ModalContent from 'Components/Modal/ModalContent';
import ModalFooter from 'Components/Modal/ModalFooter';
import ModalHeader from 'Components/Modal/ModalHeader';
import { kinds } from 'Helpers/Props';
import translate from 'Utilities/String/translate';

interface ConnectionLostModalProps {
  isOpen: boolean;
}

function ConnectionLostModal(props: ConnectionLostModalProps) {
  const { isOpen } = props;

  const handleModalClose = useCallback(() => {
    location.reload();
  }, []);

  return (
    <Modal isOpen={isOpen} onModalClose={handleModalClose}>
      <ModalContent onModalClose={handleModalClose}>
        <ModalHeader>{translate('ConnectionLost')}</ModalHeader>

        <ModalBody>
          <div>
            {translate('ConnectionLostToBackend', { appName: 'Whisparr' })}
          </div>

          <Box sx={{ mt: '20px' }}>
            {translate('ConnectionLostReconnect', { appName: 'Whisparr' })}
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button kind={kinds.PRIMARY} onPress={handleModalClose}>
            {translate('Reload')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default ConnectionLostModal;
