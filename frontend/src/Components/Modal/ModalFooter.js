import DialogActions from '@mui/material/DialogActions';
import PropTypes from 'prop-types';
import React from 'react';

function ModalFooter(props) {
  const {
    children,
    ...otherProps
  } = props;

  return (
    <DialogActions {...otherProps}>
      {children}
    </DialogActions>
  );
}

ModalFooter.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  sx: PropTypes.any
};

export default ModalFooter;
