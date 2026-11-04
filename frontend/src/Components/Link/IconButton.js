import MuiIconButton from '@mui/material/IconButton';
import PropTypes from 'prop-types';
import React from 'react';
import Icon from 'Components/Icon';
import Tooltip from 'Components/Tooltip/Tooltip';
import { tooltipPositions } from 'Helpers/Props';
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
    useTooltip = false,
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

  const isExternal = to && externalUrlRegex.test(to);
  const button = isExternal || to ? (
    <MuiIconButton
      component="a"
      href={isExternal || noRouter ? to : withUrlBase(to)}
      target={isExternal ? (target || '_blank') : target}
      rel={isExternal ? 'noreferrer' : undefined}
      aria-label={label}
      title={useTooltip ? undefined : label}
      disabled={isDisabled}
      onClick={onPress}
      {...otherProps}
    >
      {icon}
    </MuiIconButton>
  ) : (
    <MuiIconButton
      aria-label={label}
      title={useTooltip ? undefined : label}
      disabled={isDisabled}
      onClick={onPress}
      {...otherProps}
    >
      {icon}
    </MuiIconButton>
  );

  if (!useTooltip) {
    return button;
  }

  return (
    <Tooltip
      position={tooltipPositions.TOP}
      tooltip={label}
      anchor={button}
    />
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
  useTooltip: PropTypes.bool,
  onPress: PropTypes.func,
  sx: PropTypes.any
};

IconButton.defaultProps = {
  size: 12
};

export default IconButton;
