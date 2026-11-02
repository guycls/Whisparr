import PropTypes from 'prop-types';
import React from 'react';
import CheckInput from 'Components/Form/CheckInput';
import TableHeaderCell from './TableHeaderCell';

function getValue(allSelected, allUnselected) {
  if (allSelected) {
    return true;
  } else if (allUnselected) {
    return false;
  }

  return null;
}

function TableSelectAllHeaderCell(props) {
  const {
    allSelected,
    allUnselected,
    onSelectAllChange
  } = props;

  const value = getValue(allSelected, allUnselected);

  return (
    <TableHeaderCell
      sx={{ width: 30 }}
      name="selectAll"
    >
      <CheckInput
        name="selectAll"
        value={value}
        onChange={onSelectAllChange}
      />
    </TableHeaderCell>
  );
}

TableSelectAllHeaderCell.propTypes = {
  allSelected: PropTypes.bool.isRequired,
  allUnselected: PropTypes.bool.isRequired,
  onSelectAllChange: PropTypes.func.isRequired
};

export default TableSelectAllHeaderCell;
