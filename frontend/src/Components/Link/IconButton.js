import MuiIconButton from '@mui/material/IconButton';
import PropTypes from 'prop-types';
import React from 'react';
import Icon from 'Components/Icon';
import translate from 'Utilities/String/translate';
import { withUrlBase } from './Link';

const externalUrlRegex = /\w+?:\/\//;

function IconButton(props) {
  const {
    name,
    kind,
    iconClassName,
    size,
    isSpinning,
    isDisabled,
    title,
    to,
    target,
    noRouter,
    onPress,
    ...otherProps
  } = props;

  const label = typeof title === 'function' ? title() : title || translate('TableOptionsButton');
  const icon = (
    <Icon
      name={name}
      kind={kind}
      size={size}
      isSpinning={isSpinning}
    />
  );

  if (to && externalUrlRegex.test(to)) {
    return (
      <MuiIconButton
        component="a"
        href={to}
        target={target || '_blank'}
        rel="noreferrer"
        aria-label={label}
        title={label}
        disabled={isDisabled}
        onClick={onPress}
        {...otherProps}
      >
        {icon}
      </MuiIconButton>
    );
  }

  if (to) {
    return (
      <MuiIconButton
        component="a"
        href={noRouter ? to : withUrlBase(to)}
        target={target}
        aria-label={label}
        title={label}
        disabled={isDisabled}
        onClick={onPress}
        {...otherProps}
      >
        {icon}
      </MuiIconButton>
    );
  }

  return (
    <MuiIconButton
      aria-label={label}
      title={label}
      disabled={isDisabled}
      onClick={onPress}
      {...otherProps}
    >
      {icon}
    </MuiIconButton>
  );
}

IconButton.propTypes = {
  className: PropTypes.string,
  iconClassName: PropTypes.string,
  kind: PropTypes.string,
  name: PropTypes.object.isRequired,
  size: PropTypes.number,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  to: PropTypes.string,
  target: PropTypes.string,
  noRouter: PropTypes.bool,
  isSpinning: PropTypes.bool,
  isDisabled: PropTypes.bool,
  onPress: PropTypes.func,
  sx: PropTypes.any
};

IconButton.defaultProps = {
  size: 12
};

export default IconButton;
