import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Icon from 'Components/Icon';
import Link from 'Components/Link/Link';
import { icons, sortDirections } from 'Helpers/Props';

const headerCellSx = {
  padding: '8px',
  border: 'none !important',
  textAlign: 'left',
  fontWeight: 'bold',
  '@media (max-width: 768px)': {
    whiteSpace: 'nowrap'
  }
};

export function headerRenderer(headerProps) {
  const {
    columnData = {},
    dataKey,
    label
  } = headerProps;

  return (

    // eslint-disable-next-line no-use-before-define
    <VirtualTableHeaderCell
      name={dataKey}
      {...columnData}
    >
      {label}
    </VirtualTableHeaderCell>
  );
}

class VirtualTableHeaderCell extends Component {

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
      name,
      isSortable,
      sortKey,
      sortDirection,
      fixedSortDirection,
      children,
      onSortPress,
      sx,
      ...otherProps
    } = this.props;

    const isSorting = isSortable && sortKey === name;
    const sortIcon = sortDirection === sortDirections.ASCENDING ?
      icons.SORT_ASCENDING :
      icons.SORT_DESCENDING;

    const cellSx = [
      headerCellSx,
      ...(Array.isArray(sx) ? sx : [sx])
    ];

    return (
      isSortable ?
        <Link
          component="div"
          className={className}
          onPress={this.onPress}
          {...otherProps}
          sx={cellSx}
        >
          {children}

          {
            isSorting &&
              <Box
                component="span"
                sx={{ ml: '10px' }}
              >
                <Icon
                  name={sortIcon}
                />
              </Box>
          }
        </Link> :

        <Box
          className={className}
          {...otherProps}
          sx={cellSx}
        >
          {children}
        </Box>
    );
  }
}

VirtualTableHeaderCell.propTypes = {
  className: PropTypes.string,
  name: PropTypes.string.isRequired,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  isSortable: PropTypes.bool,
  sortKey: PropTypes.string,
  fixedSortDirection: PropTypes.string,
  sortDirection: PropTypes.string,
  children: PropTypes.node,
  onSortPress: PropTypes.func,
  sx: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.func])
};

VirtualTableHeaderCell.defaultProps = {
  isSortable: false
};

export default VirtualTableHeaderCell;
