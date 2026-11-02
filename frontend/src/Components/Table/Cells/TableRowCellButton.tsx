import React, { ReactNode } from 'react';
import Link, { LinkProps } from 'Components/Link/Link';
import TableRowCell from './TableRowCell';

interface TableRowCellButtonProps extends LinkProps {
  className?: string;
  children: ReactNode;
}

function TableRowCellButton(props: TableRowCellButtonProps) {
  const { className, ...otherProps } = props;

  return (
    <Link
      className={className}
      component={TableRowCell as unknown as LinkProps['component']}
      {...otherProps}
    />
  );
}

export default TableRowCellButton;
