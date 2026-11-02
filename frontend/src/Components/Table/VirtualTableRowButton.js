import React from 'react';
import Link from 'Components/Link/Link';
import VirtualTableRow from './VirtualTableRow';

function VirtualTableRowButton(props) {
  return (
    <Link
      component={VirtualTableRow}
      {...props}
    />
  );
}

export default VirtualTableRowButton;
