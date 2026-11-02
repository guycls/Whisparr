import TableCell, { TableCellProps } from '@mui/material/TableCell';
import React from 'react';

export type TableRowCellProps = TableCellProps;

export default function TableRowCell({
  className,
  children,
  ...cellProps
}: TableRowCellProps) {
  return (
    <TableCell className={className} {...cellProps}>
      {children}
    </TableCell>
  );
}
