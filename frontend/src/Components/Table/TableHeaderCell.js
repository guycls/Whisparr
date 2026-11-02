import TableCell from '@mui/material/TableCell';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Icon from 'Components/Icon';
import Link from 'Components/Link/Link';
import { icons, sortDirections } from 'Helpers/Props';

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
    const sortIcon = sortDirection === sortDirections.ASCENDING ?
      icons.SORT_ASCENDING :
      icons.SORT_DESCENDING;

    return (
      isSortable ?
        <TableCell
          component="th"
          className={className}
          sx={sx}
        >
          <Link
            {...otherProps}
            title={typeof columnLabel === 'function' ? columnLabel() : columnLabel}
            onPress={this.onPress}
            sx={{
              minWidth: 0,
              justifyContent: 'flex-start',
              p: 0,
              color: 'text.secondary',
              fontSize: 12,
              fontWeight: 600,
              lineHeight: 1.4,
              whiteSpace: 'nowrap',
              '&:hover': {
                backgroundColor: 'transparent',
                color: 'primary.main',
              },
            }}
          >
            {children}

            {
              isSorting &&
                <Icon
                  name={sortIcon}
                />
            }
          </Link>
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
