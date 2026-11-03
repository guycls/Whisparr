import React from 'react';
import MenuContent from 'Components/Menu/MenuContent';
import SortMenu from 'Components/Menu/SortMenu';
import SortMenuItem from 'Components/Menu/SortMenuItem';
import { align } from 'Helpers/Props';
import { SortDirection } from 'Helpers/Props/sortDirections';
import translate from 'Utilities/String/translate';

interface SeriesDetailsSortMenuProps {
  sortKey?: string;
  sortDirection?: SortDirection;
  onSortSelect(sortKey: string): void;
}

function SeriesDetailsSortMenu(props: SeriesDetailsSortMenuProps) {
  const { sortKey, sortDirection, onSortSelect } = props;

  return (
    <SortMenu alignMenu={align.RIGHT}>
      <MenuContent>
        <SortMenuItem
          name="releaseDate"
          sortKey={sortKey}
          sortDirection={sortDirection}
          onPress={onSortSelect}
        >
          {translate('Date')}
        </SortMenuItem>

        <SortMenuItem
          name="title"
          sortKey={sortKey}
          sortDirection={sortDirection}
          onPress={onSortSelect}
        >
          {translate('Title')}
        </SortMenuItem>
      </MenuContent>
    </SortMenu>
  );
}

export default SeriesDetailsSortMenu;
