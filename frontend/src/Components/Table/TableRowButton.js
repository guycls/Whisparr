import React from 'react';
import Link from 'Components/Link/Link';
import TableRow from './TableRow';

function TableRowButton(props) {
  const { sx, ...otherProps } = props;

  return (
    <Link
      component={TableRow}
      sx={[
        {
          transition: 'background-color 500ms',
          '&:hover': {
            backgroundColor: 'var(--tableRowHoverBackgroundColor)'
          }
        },
        ...(Array.isArray(sx) ? sx : [sx])
      ]}
      {...otherProps}
    />
  );
}

export default TableRowButton;
