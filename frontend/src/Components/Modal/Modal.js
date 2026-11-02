import Dialog from '@mui/material/Dialog';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ErrorBoundary from 'Components/Error/ErrorBoundary';
import { sizes } from 'Helpers/Props';
import { sizeToDialogMaxWidth } from 'Helpers/Props/muiKind';
import ModalError from './ModalError';

class Modal extends Component {

  //
  // Listeners

  onClose = (event, reason) => {
    if (reason === 'backdropClick' && !this.props.closeOnBackgroundClick) {
      return;
    }

    this.props.onModalClose();
  };

  //
  // Render

  render() {
    const {
      className,
      style,
      size,
      children,
      isOpen,
      onModalClose
    } = this.props;

    return (
      <Dialog
        open={!!isOpen}
        fullWidth={true}
        maxWidth={sizeToDialogMaxWidth(size)}
        onClose={this.onClose}
        slotProps={{
          paper: {
            className,
            style
          }
        }}
      >
        <ErrorBoundary
          errorComponent={ModalError}
          onModalClose={onModalClose}
        >
          {children}
        </ErrorBoundary>
      </Dialog>
    );
  }
}

Modal.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,
  backdropClassName: PropTypes.string,
  size: PropTypes.oneOf(sizes.all),
  children: PropTypes.node,
  isOpen: PropTypes.bool.isRequired,
  closeOnBackgroundClick: PropTypes.bool.isRequired,
  onModalClose: PropTypes.func.isRequired
};

Modal.defaultProps = {
  size: sizes.LARGE,
  closeOnBackgroundClick: true
};

export default Modal;
