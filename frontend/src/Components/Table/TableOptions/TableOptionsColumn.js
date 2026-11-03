import ListItem from '@mui/material/ListItem';
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

  const labelText = typeof label === 'function' ? label() : label;

  return (
    <ListItem
      sx={{
        mb: '4px',
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        bgcolor: 'background.paper',
        opacity: isDragging ? 0.25 : 1
      }}
      secondaryAction={
        connectDragSource ?
          connectDragSource(
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                cursor: 'grab'
              }}
            >
              <Icon name={icons.REORDER} />
            </span>
          ) :
          undefined
      }
    >
      <CheckInput
        name={name}
        value={isVisible}
        helpText={labelText}
        isDisabled={isModifiable === false}
        onChange={onVisibleChange}
      />
    </ListItem>
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
