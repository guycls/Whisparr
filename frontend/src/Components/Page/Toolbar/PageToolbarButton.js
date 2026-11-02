import Stack from '@mui/material/Stack';
import PropTypes from 'prop-types';
import React from 'react';
import Icon from 'Components/Icon';
import Button from 'Components/Link/Button';
import { icons, kinds } from 'Helpers/Props';

function PageToolbarButton(props) {
  const {
    label,
    iconName,
    spinningName,
    isDisabled,
    isSpinning,
    ...otherProps
  } = props;

  return (
    <Button
      kind={kinds.DEFAULT}
      isDisabled={isDisabled || isSpinning}
      {...otherProps}
      sx={{
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '2px',
        width: 72,
        minWidth: 72,
        maxWidth: 72,
        height: 56,
        minHeight: 56,
        m: 0,
        p: '6px 4px 4px',
        border: 'none',
        borderRadius: 1,
        color: 'inherit',
        lineHeight: 1,
        overflow: 'hidden',
        textTransform: 'none',
        whiteSpace: 'normal',
        '&.MuiButton-outlined': {
          border: 'none'
        },
        '&:hover': {
          border: 'none',
          backgroundColor: 'action.hover',
          color: 'primary.main'
        }
      }}
    >
      <Icon
        name={isSpinning ? (spinningName || iconName) : iconName}
        isSpinning={isSpinning}
        size={21}
      />

      <Stack
        component="span"
        sx={{
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: 24,
          px: '3px',
          overflow: 'hidden',
          color: 'text.secondary',
          fontSize: 11,
          lineHeight: '12px',
          textAlign: 'center',
          whiteSpace: 'normal'
        }}
      >
        {label}
      </Stack>
    </Button>
  );
}

PageToolbarButton.propTypes = {
  label: PropTypes.string.isRequired,
  iconName: PropTypes.object.isRequired,
  spinningName: PropTypes.object,
  isSpinning: PropTypes.bool,
  isDisabled: PropTypes.bool,
  onPress: PropTypes.func
};

PageToolbarButton.defaultProps = {
  spinningName: icons.SPINNER,
  isDisabled: false,
  isSpinning: false
};

export default PageToolbarButton;
