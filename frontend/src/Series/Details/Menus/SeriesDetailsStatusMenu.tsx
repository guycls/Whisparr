import React from 'react';
import MenuContent from 'Components/Menu/MenuContent';
import StatusMenu from 'Components/Menu/StatusMenu';
import ViewMenuItem from 'Components/Menu/ViewMenuItem';
import { align } from 'Helpers/Props';
import translate from 'Utilities/String/translate';

interface SeriesDetailsStatusMenuProps {
  monitorStatusFilter: string;
  onStatusSelect(value: string): unknown;
}

function SeriesDetailsStatusMenu(props: SeriesDetailsStatusMenuProps) {
  const { monitorStatusFilter, onStatusSelect } = props;

  return (
    <StatusMenu
      alignMenu={align.RIGHT}
      showIndicator={monitorStatusFilter !== 'all'}
    >
      <MenuContent>
        <ViewMenuItem name="all" selectedView={monitorStatusFilter} onPress={onStatusSelect}>
          {translate('All')}
        </ViewMenuItem>

        <ViewMenuItem name="monitored" selectedView={monitorStatusFilter} onPress={onStatusSelect}>
          {translate('Monitored')}
        </ViewMenuItem>

        <ViewMenuItem name="unmonitored" selectedView={monitorStatusFilter} onPress={onStatusSelect}>
          {translate('Unmonitored')}
        </ViewMenuItem>

        <ViewMenuItem name="downloaded" selectedView={monitorStatusFilter} onPress={onStatusSelect}>
          {translate('Downloaded')}
        </ViewMenuItem>

        <ViewMenuItem name="missing" selectedView={monitorStatusFilter} onPress={onStatusSelect}>
          {translate('Missing')}
        </ViewMenuItem>
      </MenuContent>
    </StatusMenu>
  );
}

export default SeriesDetailsStatusMenu;
