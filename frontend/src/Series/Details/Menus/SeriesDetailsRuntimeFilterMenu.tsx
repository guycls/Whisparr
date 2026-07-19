import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactSlider from 'react-slider';
import Menu from 'Components/Menu/Menu';
import MenuContent from 'Components/Menu/MenuContent';
import ToolbarMenuButton from 'Components/Menu/ToolbarMenuButton';
import { align, icons } from 'Helpers/Props';
import {
  formatRuntimeFilterLabel,
  isFullRuntimeRange,
  roundRuntimeMax,
  RuntimeFilter,
} from 'Utilities/Number/runtimeFilterUtils';
import translate from 'Utilities/String/translate';
import styles from './SeriesDetailsRuntimeFilterMenu.css';

interface SeriesDetailsRuntimeFilterMenuProps {
  runtimeFilter: RuntimeFilter;
  seriesMaxRuntime: number;
  onRuntimeFilterChange(runtimeFilter: RuntimeFilter): void;
}

function SeriesDetailsRuntimeFilterMenu(
  props: SeriesDetailsRuntimeFilterMenuProps
) {
  const { runtimeFilter, seriesMaxRuntime, onRuntimeFilterChange } = props;

  const [showEndpointLabels, setShowEndpointLabels] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draftFilter, setDraftFilter] = useState(runtimeFilter);
  const draftFilterRef = useRef(runtimeFilter);

  const resolvedMaxRuntime = useMemo(() => {
    return roundRuntimeMax(seriesMaxRuntime);
  }, [seriesMaxRuntime]);

  useEffect(() => {
    if (!isDragging) {
      draftFilterRef.current = runtimeFilter;
      setDraftFilter(runtimeFilter);
    }
  }, [runtimeFilter, isDragging]);

  const activeFilter = isDragging ? draftFilter : runtimeFilter;
  const { minMinutes, maxMinutes } = activeFilter;

  const resolvedMaxMinutes = maxMinutes ?? resolvedMaxRuntime;
  const sliderStep = resolvedMaxRuntime > 0 ? 10 : 1;
  const isFilterActive = !isFullRuntimeRange(
    runtimeFilter.minMinutes,
    runtimeFilter.maxMinutes,
    resolvedMaxRuntime
  );

  const onSliderChange = useCallback(
    ([nextMinMinutes, nextMaxMinutes]: number[]) => {
      const nextFilter = {
        minMinutes: nextMinMinutes,
        maxMinutes:
          nextMaxMinutes >= resolvedMaxRuntime ? null : nextMaxMinutes,
      };

      draftFilterRef.current = nextFilter;
      setDraftFilter(nextFilter);
    },
    [resolvedMaxRuntime]
  );

  const onPointerDown = useCallback(() => {
    setIsDragging(true);
    setShowEndpointLabels(true);
  }, []);

  const onPointerUp = useCallback(() => {
    setIsDragging(false);
    setShowEndpointLabels(false);
    onRuntimeFilterChange(draftFilterRef.current);
  }, [onRuntimeFilterChange]);

  const trackRenderer = useCallback(
    (trackProps: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...trackProps} className={styles.track} />
    ),
    []
  );

  const thumbRenderer = useCallback(
    (
      thumbProps: React.HTMLAttributes<HTMLDivElement>,
      { index }: { index: number }
    ) => {
      const minutes = index === 0 ? minMinutes : resolvedMaxMinutes;
      const label = formatRuntimeFilterLabel(minutes);

      return (
        <div {...thumbProps} className={styles.thumb}>
          {showEndpointLabels ? (
            <div className={styles.thumbLabel}>{label}</div>
          ) : null}
        </div>
      );
    },
    [minMinutes, resolvedMaxMinutes, showEndpointLabels]
  );

  const minLabel = formatRuntimeFilterLabel(minMinutes);
  const maxLabel = formatRuntimeFilterLabel(resolvedMaxMinutes);

  return (
    <Menu alignMenu={align.RIGHT} enforceMaxHeight={false}>
      <ToolbarMenuButton
        iconName={icons.FILTER}
        text={translate('Runtime')}
        showIndicator={isFilterActive}
      />

      <MenuContent className={styles.menuContent}>
        <div className={styles.panel}>
          <div className={styles.endpointLabels}>
            <span className={styles.endpointLabel}>
              {translate('SeriesDetailsRuntimeFilterUnknown')}
            </span>
            <span className={styles.endpointLabel}>{maxLabel}</span>
          </div>

          <div
            className={styles.sliderContainer}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <ReactSlider
              className={styles.slider}
              min={0}
              max={resolvedMaxRuntime}
              step={sliderStep}
              minDistance={0}
              pearling={true}
              disabled={resolvedMaxRuntime === 0}
              value={[minMinutes, resolvedMaxMinutes]}
              renderTrack={trackRenderer}
              renderThumb={thumbRenderer}
              onChange={onSliderChange}
            />
          </div>

          <div className={styles.rangeSummary}>
            {translate('SeriesDetailsRuntimeFilterRange', {
              minLabel,
              maxLabel,
            })}
          </div>
        </div>
      </MenuContent>
    </Menu>
  );
}

export default SeriesDetailsRuntimeFilterMenu;
