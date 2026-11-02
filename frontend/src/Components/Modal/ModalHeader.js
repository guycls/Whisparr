import DialogTitle from '@mui/material/DialogTitle';
import PropTypes from 'prop-types';
import React from 'react';

function ModalHeader(props) {
  const {
    children,
    ...otherProps
  } = props;

  return (
    <DialogTitle {...otherProps}>
      {children}
    </DialogTitle>
  );
}

ModalHeader.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node
};

export default ModalHeader;
