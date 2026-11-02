import DialogContent from '@mui/material/DialogContent';
import PropTypes from 'prop-types';
import React from 'react';
import { scrollDirections } from 'Helpers/Props';

function ModalBody(props) {
  const {
    children
  } = props;

  return (
    <DialogContent dividers={true}>
      {children}
    </DialogContent>
  );
}

ModalBody.propTypes = {
  className: PropTypes.string,
  innerClassName: PropTypes.string,
  children: PropTypes.node,
  scrollDirection: PropTypes.oneOf(scrollDirections.all)
};

ModalBody.defaultProps = {
  scrollDirection: scrollDirections.VERTICAL
};

export default ModalBody;
