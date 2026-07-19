import React from 'react';
import MenuContent from 'Components/Menu/MenuContent';
import ViewMenu from 'Components/Menu/ViewMenu';
import ViewMenuItem from 'Components/Menu/ViewMenuItem';
import { align } from 'Helpers/Props';
import translate from 'Utilities/String/translate';

interface SeriesDetailsViewMenuProps {
  view: string;
  onViewSelect(value: string): unknown;
}

function SeriesDetailsViewMenu(props: SeriesDetailsViewMenuProps) {
  const { view, onViewSelect } = props;

  return (
    <ViewMenu alignMenu={align.RIGHT}>
      <MenuContent>
        <ViewMenuItem name="unifiedGrid" selectedView={view} onPress={onViewSelect}>
          {translate('UnifiedGrid')}
        </ViewMenuItem>

        <ViewMenuItem name="list" selectedView={view} onPress={onViewSelect}>
          {translate('List')}
        </ViewMenuItem>

        <ViewMenuItem name="grid" selectedView={view} onPress={onViewSelect}>
          {translate('Grid')}
        </ViewMenuItem>
      </MenuContent>
    </ViewMenu>
  );
}

export default SeriesDetailsViewMenu;
