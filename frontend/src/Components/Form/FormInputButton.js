import PropTypes from 'prop-types';
import React from 'react';
import Button from 'Components/Link/Button';
import SpinnerButton from 'Components/Link/SpinnerButton';
import { kinds } from 'Helpers/Props';

function FormInputButton(props) {
  const {
    canSpin,
    ...otherProps
  } = props;

  if (canSpin) {
    return (
      <SpinnerButton
        kind={kinds.PRIMARY}
        {...otherProps}
      />
    );
  }

  return (
    <Button
      kind={kinds.PRIMARY}
      {...otherProps}
    />
  );
}

FormInputButton.propTypes = {
  className: PropTypes.string,
  isLastButton: PropTypes.bool.isRequired,
  canSpin: PropTypes.bool.isRequired,
  children: PropTypes.node,
  id: PropTypes.string,
  kind: PropTypes.string,
  onClick: PropTypes.func,
  onPress: PropTypes.func
};

FormInputButton.defaultProps = {
  isLastButton: true,
  canSpin: false
};

export default FormInputButton;
