import React, { useCallback } from 'react';
import { useSelect } from 'App/SelectContext';
import Table from 'Components/Table/Table';
import { SortDirection } from 'Helpers/Props/sortDirections';

interface Column {
  name: string;
  isVisible?: boolean;
}

interface EpisodeItem {
  id: number;
}

interface SeriesDetailsEpisodeTableProps {
  items: EpisodeItem[];
  columns: Column[];
  sortKey?: string;
  sortDirection?: SortDirection;
  isSelectMode?: boolean;
  children: React.ReactNode;
  onSortPress: (sortKey: string, sortDirection: SortDirection) => void;
  onTableOptionChange: (payload: unknown) => void;
}

function SeriesDetailsEpisodeTable(props: SeriesDetailsEpisodeTableProps) {
  const {
    items,
    columns,
    sortKey,
    sortDirection,
    isSelectMode = false,
    children,
    onSortPress,
    onTableOptionChange,
  } = props;

  const [selectState, selectDispatch] = useSelect();
  const selectedCount = items.filter(
    (item) => selectState.selectedState[item.id]
  ).length;
  const allSelected = items.length > 0 && selectedCount === items.length;
  const allUnselected = selectedCount === 0;

  const onSelectAllChange = useCallback(
    ({ value }: { value: boolean }) => {
      items.forEach((item) => {
        const isSelected = !!selectState.selectedState[item.id];

        if (isSelected !== value) {
          selectDispatch({
            type: 'toggleSelected',
            id: item.id,
            isSelected: value,
            shiftKey: false,
          });
        }
      });
    },
    [items, selectDispatch, selectState.selectedState]
  );

  return (
    <Table
      columns={columns}
      sortKey={sortKey}
      sortDirection={sortDirection}
      selectAll={isSelectMode}
      allSelected={allSelected}
      allUnselected={allUnselected}
      onSelectAllChange={onSelectAllChange}
      onSortPress={onSortPress}
      onTableOptionChange={onTableOptionChange}
    >
      {children}
    </Table>
  );
}

export default SeriesDetailsEpisodeTable;
