import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React from 'react';
import CheckInput from 'Components/Form/CheckInput';
import Icon from 'Components/Icon';
import { icons } from 'Helpers/Props';

function TableOptionsColumn(props) {
  const {
    name,
    label,
    isVisible,
    isModifiable,
    isDragging,
    connectDragSource,
    onVisibleChange
  } = props;

  return (
    <Box sx={isModifiable ? undefined : { py: '4px' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'stretch',
          width: '100%',
          border: '1px solid #aaa',
          borderRadius: '4px',
          background: 'var(--inputBackgroundColor)',
          opacity: isDragging ? 0.25 : undefined
        }}
      >
        <Box
          component="label"
          sx={{
            display: 'flex',
            flexGrow: 1,
            mb: 0,
            ml: '2px',
            fontWeight: 'normal',
            lineHeight: '36px',
            cursor: 'pointer'
          }}
        >
          <Box sx={{ position: 'relative', mr: '4px', mb: '7px', ml: '8px' }}>
            <CheckInput
              name={name}
              value={isVisible}
              isDisabled={isModifiable === false}
              onChange={onVisibleChange}
            />
          </Box>
          {typeof label === 'function' ? label() : label}
        </Box>

        {
          !!connectDragSource &&
            connectDragSource(
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  ml: 'auto',
                  width: 40,
                  textAlign: 'center',
                  cursor: 'grab'
                }}
              >
                <Icon
                  name={icons.REORDER}
                />
              </Box>
            )
        }
      </Box>
    </Box>
  );
}

TableOptionsColumn.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
  isVisible: PropTypes.bool.isRequired,
  isModifiable: PropTypes.bool.isRequired,
  index: PropTypes.number.isRequired,
  isDragging: PropTypes.bool,
  connectDragSource: PropTypes.func,
  onVisibleChange: PropTypes.func.isRequired
};

export default TableOptionsColumn;
