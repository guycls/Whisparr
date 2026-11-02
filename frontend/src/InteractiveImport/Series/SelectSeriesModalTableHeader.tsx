import React from 'react';
import Column from 'Components/Table/Column';
import VirtualTableHeader from 'Components/Table/VirtualTableHeader';
import VirtualTableHeaderCell from 'Components/Table/VirtualTableHeaderCell';

const columnSx: Record<string, { flex: string }> = {
  title: { flex: '4 0 140px' },
  year: { flex: '0 0 70px' },
  tvdbId: { flex: '0 0 110px' },
};

interface SelectSeriesModalTableHeaderProps {
  columns: Column[];
}

function SelectSeriesModalTableHeader(
  props: SelectSeriesModalTableHeaderProps
) {
  const { columns } = props;

  return (
    <VirtualTableHeader>
      {columns.map((column) => {
        const { name, label, isVisible } = column;

        if (!isVisible) {
          return null;
        }

        return (
          <VirtualTableHeaderCell key={name} sx={columnSx[name]} name={name}>
            {typeof label === 'function' ? label() : label}
          </VirtualTableHeaderCell>
        );
      })}
    </VirtualTableHeader>
  );
}

export default SelectSeriesModalTableHeader;
