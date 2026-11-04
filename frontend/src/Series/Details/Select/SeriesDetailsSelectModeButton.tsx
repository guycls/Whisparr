import React, { useCallback } from 'react';
import { useSelect } from 'App/SelectContext';
import PageToolbarButton from 'Components/Page/Toolbar/PageToolbarButton';
import type { IconName } from 'Helpers/Props/icons';

interface SeriesDetailsSelectModeButtonProps {
  label: string;
  iconName: IconName;
  isSelectMode: boolean;
  overflowComponent: React.FunctionComponent<never>;
  onPress: () => void;
}

function SeriesDetailsSelectModeButton(
  props: SeriesDetailsSelectModeButtonProps
) {
  const { label, iconName, isSelectMode, onPress } = props;
  const [, selectDispatch] = useSelect();

  const onPressWrapper = useCallback(() => {
    if (isSelectMode) {
      selectDispatch({
        type: 'reset',
      });
    }

    onPress();
  }, [isSelectMode, onPress, selectDispatch]);

  return (
    <PageToolbarButton
      label={label}
      iconName={iconName}
      onPress={onPressWrapper}
    />
  );
}

export default SeriesDetailsSelectModeButton;
