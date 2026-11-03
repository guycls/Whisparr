import TableCell from '@mui/material/TableCell';
import TableSortLabel from '@mui/material/TableSortLabel';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { sortDirections } from 'Helpers/Props';

class TableHeaderCell extends Component {

  //
  // Listeners

  onPress = () => {
    const {
      name,
      fixedSortDirection
    } = this.props;

    if (fixedSortDirection) {
      this.props.onSortPress(name, fixedSortDirection);
    } else {
      this.props.onSortPress(name);
    }
  };

  //
  // Render

  render() {
    const {
      className,
      sx,
      name,
      label,
      columnLabel,
      isSortable,
      isVisible,
      isModifiable,
      sortKey,
      sortDirection,
      fixedSortDirection,
      children,
      onSortPress,
      ...otherProps
    } = this.props;

    const isSorting = isSortable && sortKey === name;
    const direction = sortDirection === sortDirections.DESCENDING ? 'desc' : 'asc';

    return (
      isSortable ?
        <TableCell
          component="th"
          className={className}
          sx={sx}
          sortDirection={isSorting ? direction : false}
        >
          <TableSortLabel
            {...otherProps}
            active={isSorting}
            direction={isSorting ? direction : 'asc'}
            title={typeof columnLabel === 'function' ? columnLabel() : columnLabel}
            onClick={this.onPress}
          >
            {children}
          </TableSortLabel>
        </TableCell> :

        <TableCell
          component="th"
          className={className}
          sx={sx}
        >
          {children}
        </TableCell>
    );
  }
}

TableHeaderCell.propTypes = {
  className: PropTypes.string,
  name: PropTypes.string.isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.node]),
  columnLabel: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  isSortable: PropTypes.bool,
  isVisible: PropTypes.bool,
  isModifiable: PropTypes.bool,
  sortKey: PropTypes.string,
  fixedSortDirection: PropTypes.string,
  sortDirection: PropTypes.string,
  children: PropTypes.node,
  onSortPress: PropTypes.func
};

TableHeaderCell.defaultProps = {
  isSortable: false
};

export default TableHeaderCell;
