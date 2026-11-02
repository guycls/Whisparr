import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Icon from 'Components/Icon';
import Link from 'Components/Link/Link';
import { icons } from 'Helpers/Props';
import CheckInput from './CheckInput';

class EnhancedSelectInputOption extends Component {

  //
  // Listeners

  onPress = (e) => {
    e.preventDefault();

    const {
      id,
      onSelect
    } = this.props;

    onSelect(id);
  };

  onCheckPress = () => {
    // CheckInput requires a handler. Swallow the change event because onPress will already handle it via event propagation.
  };

  //
  // Render

  render() {
    const {
      className,
      id,
      depth,
      isSelected,
      isDisabled,
      isHidden,
      isMultiSelect,
      isMobile,
      children
    } = this.props;

    const selected = isSelected && !isMultiSelect;

    return (
      <Link
        className={className}
        component="div"
        isDisabled={isDisabled}
        sx={{
          display: isHidden ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '5px 10px',
          width: '100%',
          minWidth: 0,
          borderRadius: 0,
          textTransform: 'none',
          fontWeight: 'normal',
          color: 'inherit',
          cursor: isDisabled ? 'not-allowed' : 'default',
          backgroundColor: selected ?
            (isMobile ? 'inherit' : 'var(--inputSelectedBackgroundColor)') :
            (isDisabled && !isMultiSelect ? '#aaa' : undefined),
          height: isMobile ? 50 : undefined,
          borderBottom: isMobile ? '1px solid var(--borderColor)' : undefined,
          '&:last-child': isMobile ? { border: 'none' } : undefined,
          '&:hover': {
            backgroundColor: selected && !isMobile ?
              'var(--inputSelectedBackgroundColor)' :
              (isMobile ? 'unset' : 'var(--inputHoverBackgroundColor)')
          }
        }}
        onPress={this.onPress}
      >

        {
          depth !== 0 &&
            <div style={{ width: `${depth * 20}px` }} />
        }

        {
          isMultiSelect &&
            <Box sx={{ flex: '0 0 0' }}>
              <CheckInput
                name={`select-${id}`}
                value={isSelected}
                isDisabled={isDisabled}
                onChange={this.onCheckPress}
              />
            </Box>
        }

        {children}

        {
          isMobile &&
            <Box
              sx={{
                color: selected ? 'var(--primaryColor)' : undefined
              }}
            >
              <Icon
                name={isSelected ? icons.CHECK_CIRCLE : icons.CIRCLE_OUTLINE}
              />
            </Box>
        }
      </Link>
    );
  }
}

EnhancedSelectInputOption.propTypes = {
  className: PropTypes.string,
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  depth: PropTypes.number.isRequired,
  isSelected: PropTypes.bool.isRequired,
  isDisabled: PropTypes.bool.isRequired,
  isHidden: PropTypes.bool.isRequired,
  isMultiSelect: PropTypes.bool.isRequired,
  isMobile: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
  onSelect: PropTypes.func.isRequired
};

EnhancedSelectInputOption.defaultProps = {
  depth: 0,
  isDisabled: false,
  isHidden: false,
  isMultiSelect: false
};

export default EnhancedSelectInputOption;
