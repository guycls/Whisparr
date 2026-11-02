import React from 'react';
import Modal from 'Components/Modal/Modal';
import FileBrowserModalContent, {
  FileBrowserModalContentProps,
} from './FileBrowserModalContent';

interface FileBrowserModalProps extends FileBrowserModalContentProps {
  isOpen: boolean;
  onModalClose: () => void;
}

function FileBrowserModal(props: FileBrowserModalProps) {
  const { isOpen, onModalClose, ...otherProps } = props;

  return (
    <Modal style={{ height: 600 }} isOpen={isOpen} onModalClose={onModalClose}>
      <FileBrowserModalContent {...otherProps} onModalClose={onModalClose} />
    </Modal>
  );
}

export default FileBrowserModal;
