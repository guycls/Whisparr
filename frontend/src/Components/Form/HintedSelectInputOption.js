import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React from 'react';
import EnhancedSelectInputOption from './EnhancedSelectInputOption';

function HintedSelectInputOption(props) {
  const {
    id,
    value,
    hint,
    depth,
    isSelected,
    isDisabled,
    isMultiSelect,
    isMobile,
    ...otherProps
  } = props;

  return (
    <EnhancedSelectInputOption
      id={id}
      depth={depth}
      isSelected={isSelected}
      isDisabled={isDisabled}
      isHidden={isDisabled}
      isMultiSelect={isMultiSelect}
      isMobile={isMobile}
      {...otherProps}
    >
      <Box
        sx={{
          display: isMobile ? 'block' : 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flex: '1 0 0',
          minWidth: 0
        }}
      >
        <div>{value}</div>

        {
          hint != null &&
            <Box
              sx={{
                overflow: 'hidden',
                maxWidth: '100%',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                ml: isMobile ? 0 : '15px',
                color: 'var(--darkGray)',
                fontSize: 12
              }}
            >
              {hint}
            </Box>
        }
      </Box>
    </EnhancedSelectInputOption>
  );
}

HintedSelectInputOption.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  value: PropTypes.string.isRequired,
  hint: PropTypes.node,
  depth: PropTypes.number,
  isSelected: PropTypes.bool.isRequired,
  isDisabled: PropTypes.bool.isRequired,
  isMultiSelect: PropTypes.bool.isRequired,
  isMobile: PropTypes.bool.isRequired
};

HintedSelectInputOption.defaultProps = {
  isDisabled: false,
  isHidden: false,
  isMultiSelect: false
};

export default HintedSelectInputOption;
