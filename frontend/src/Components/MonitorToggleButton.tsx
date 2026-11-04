import React, { SyntheticEvent, useCallback, useMemo } from 'react';
import SpinnerIconButton from 'Components/Link/SpinnerIconButton';
import { icons } from 'Helpers/Props';
import translate from 'Utilities/String/translate';

interface MonitorToggleButtonProps {
  className?: string;
  monitored: boolean;
  size?: number;
  isDisabled?: boolean;
  isSaving?: boolean;
  useTooltip?: boolean;
  onPress: (value: boolean, options: { shiftKey: boolean }) => unknown;
}

function MonitorToggleButton(props: MonitorToggleButtonProps) {
  const {
    className,
    monitored,
    isDisabled = false,
    isSaving = false,
    size,
    useTooltip = false,
    onPress,
    ...otherProps
  } = props;

  const iconName = monitored ? icons.MONITORED : icons.UNMONITORED;

  const title = useMemo(() => {
    if (isDisabled) {
      return translate('ToggleMonitoredSeriesUnmonitored');
    }

    if (monitored) {
      return translate('ToggleMonitoredToUnmonitored');
    }

    return translate('ToggleUnmonitoredToMonitored');
  }, [monitored, isDisabled]);

  const handlePress = useCallback(
    (event: SyntheticEvent<HTMLLinkElement, MouseEvent>) => {
      const shiftKey = event.nativeEvent.shiftKey;

      onPress(!monitored, { shiftKey });
    },
    [monitored, onPress]
  );

  return (
    <SpinnerIconButton
      className={className}
      name={iconName}
      size={size}
      title={title}
      useTooltip={useTooltip}
      isDisabled={isDisabled}
      isSpinning={isSaving}
      sx={{
        p: 0,
        fontSize: 'inherit',
        ...(isDisabled
          ? {
              color: 'var(--disabledColor)',
              cursor: 'not-allowed',
            }
          : null),
      }}
      {...otherProps}
      onPress={handlePress}
    />
  );
}

export default MonitorToggleButton;
