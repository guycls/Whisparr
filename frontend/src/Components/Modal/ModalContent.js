import MuiIconButton from '@mui/material/IconButton';
import PropTypes from 'prop-types';
import React from 'react';
import Icon from 'Components/Icon';
import { icons } from 'Helpers/Props';
import translate from 'Utilities/String/translate';

function ModalContent(props) {
  const {
    children,
    showCloseButton,
    onModalClose
  } = props;

  return (
    <>
      {
        showCloseButton &&
          <MuiIconButton
            aria-label={translate('Close')}
            onClick={onModalClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              zIndex: 1
            }}
          >
            <Icon
              name={icons.CLOSE}
              size={18}
              title={translate('Close')}
            />
          </MuiIconButton>
      }

      {children}
    </>
  );
}

ModalContent.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  showCloseButton: PropTypes.bool.isRequired,
  onModalClose: PropTypes.func.isRequired
};

ModalContent.defaultProps = {
  showCloseButton: true
};

export default ModalContent;
