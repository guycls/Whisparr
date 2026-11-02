import MuiTable from '@mui/material/Table';
import TableContainer from '@mui/material/TableContainer';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import IconButton from 'Components/Link/IconButton';
import TableOptionsModalWrapper from 'Components/Table/TableOptions/TableOptionsModalWrapper';
import { icons } from 'Helpers/Props';
import TableHeader from './TableHeader';
import TableHeaderCell from './TableHeaderCell';
import TableSelectAllHeaderCell from './TableSelectAllHeaderCell';

const tableHeaderCellProps = [
  'sortKey',
  'sortDirection'
];

function getTableHeaderCellProps(props) {
  return _.reduce(tableHeaderCellProps, (result, key) => {
    if (props.hasOwnProperty(key)) {
      result[key] = props[key];
    }

    return result;
  }, {});
}

function Table(props) {
  const {
    horizontalScroll,
    selectAll,
    columns,
    optionsComponent,
    pageSize,
    canModifyColumns,
    children,
    onSortPress,
    onTableOptionChange,
    ...otherProps
  } = props;

  return (
    <TableContainer sx={{ overflowX: horizontalScroll ? 'auto' : 'hidden' }}>
      <MuiTable size="small">
        <TableHeader>
          {
            selectAll ?
              <TableSelectAllHeaderCell {...otherProps} /> :
              null
          }

          {
            columns.map((column) => {
              const {
                name,
                isVisible
              } = column;

              if (!isVisible) {
                return null;
              }

              if (
                (name === 'actions' || name === 'details') &&
                onTableOptionChange
              ) {
                return (
                  <TableHeaderCell
                    key={name}
                    name={name}
                    isSortable={false}
                    {...otherProps}
                  >
                    <TableOptionsModalWrapper
                      columns={columns}
                      optionsComponent={optionsComponent}
                      pageSize={pageSize}
                      canModifyColumns={canModifyColumns}
                      onTableOptionChange={onTableOptionChange}
                    >
                      <IconButton
                        name={icons.ADVANCED_SETTINGS}
                      />
                    </TableOptionsModalWrapper>
                  </TableHeaderCell>
                );
              }

              return (
                <TableHeaderCell
                  key={column.name}
                  onSortPress={onSortPress}
                  {...getTableHeaderCellProps(otherProps)}
                  {...column}
                >
                  {typeof column.label === 'function' ? column.label() : column.label}
                </TableHeaderCell>
              );
            })
          }

        </TableHeader>
        {children}
      </MuiTable>
    </TableContainer>
  );
}

Table.propTypes = {
  ...TableHeaderCell.props,
  className: PropTypes.string,
  horizontalScroll: PropTypes.bool.isRequired,
  selectAll: PropTypes.bool.isRequired,
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  optionsComponent: PropTypes.elementType,
  pageSize: PropTypes.number,
  canModifyColumns: PropTypes.bool,
  children: PropTypes.node,
  onSortPress: PropTypes.func,
  onTableOptionChange: PropTypes.func
};

Table.defaultProps = {
  horizontalScroll: true,
  selectAll: false
};

export default Table;
