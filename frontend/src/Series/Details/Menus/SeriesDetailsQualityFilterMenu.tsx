import React, { useCallback, useState } from 'react';
import ReactSlider from 'react-slider';
import Menu from 'Components/Menu/Menu';
import MenuContent from 'Components/Menu/MenuContent';
import ToolbarMenuButton from 'Components/Menu/ToolbarMenuButton';
import { align, icons } from 'Helpers/Props';
import {
  formatQualityTierLabel,
  getQualityFilterTier,
  isFullQualityRange,
  QUALITY_FILTER_MAX_INDEX,
  QUALITY_FILTER_TIERS,
} from 'Utilities/Quality/qualityFilterTiers';
import translate from 'Utilities/String/translate';
import styles from './SeriesDetailsQualityFilterMenu.css';

interface QualityFilter {
  minIndex: number;
  maxIndex: number;
}

interface SeriesDetailsQualityFilterMenuProps {
  qualityFilter: QualityFilter;
  onQualityFilterChange(qualityFilter: QualityFilter): void;
}

function SeriesDetailsQualityFilterMenu(
  props: SeriesDetailsQualityFilterMenuProps
) {
  const { qualityFilter, onQualityFilterChange } = props;
  const { minIndex, maxIndex } = qualityFilter;

  const [showEndpointLabels, setShowEndpointLabels] = useState(false);

  const isFilterActive = !isFullQualityRange(minIndex, maxIndex);

  const onSliderChange = useCallback(
    ([nextMinIndex, nextMaxIndex]: number[]) => {
      onQualityFilterChange({
        minIndex: nextMinIndex,
        maxIndex: nextMaxIndex,
      });
    },
    [onQualityFilterChange]
  );

  const onPointerDown = useCallback(() => {
    setShowEndpointLabels(true);
  }, []);

  const onPointerUp = useCallback(() => {
    setShowEndpointLabels(false);
  }, []);

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
      const tierIndex = index === 0 ? minIndex : maxIndex;
      const tier = getQualityFilterTier(tierIndex);
      const label =
        tier.isUnknown ?
          translate('SeriesDetailsQualityFilterUnknown') :
          formatQualityTierLabel(tier);

      return (
        <div {...thumbProps} className={styles.thumb}>
          {showEndpointLabels ? (
            <div className={styles.thumbLabel}>{label}</div>
          ) : null}
        </div>
      );
    },
    [minIndex, maxIndex, showEndpointLabels]
  );

  const minTier = getQualityFilterTier(minIndex);
  const maxTier = getQualityFilterTier(maxIndex);
  const minLabel =
    minTier.isUnknown ?
      translate('SeriesDetailsQualityFilterUnknown') :
      formatQualityTierLabel(minTier);
  const maxLabel =
    maxTier.isUnknown ?
      translate('SeriesDetailsQualityFilterUnknown') :
      formatQualityTierLabel(maxTier);

  return (
    <Menu alignMenu={align.RIGHT} enforceMaxHeight={false}>
      <ToolbarMenuButton
        iconName={icons.FILTER}
        text={translate('Quality')}
        showIndicator={isFilterActive}
      />

      <MenuContent className={styles.menuContent}>
        <div className={styles.panel}>
          <div className={styles.tierLabels}>
            {QUALITY_FILTER_TIERS.map((tier) => (
              <span key={tier.index} className={styles.tierLabel}>
                {tier.isUnknown ?
                  translate('SeriesDetailsQualityFilterUnknown') :
                  formatQualityTierLabel(tier)}
              </span>
            ))}
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
              max={QUALITY_FILTER_MAX_INDEX}
              step={1}
              minDistance={0}
              pearling={true}
              value={[minIndex, maxIndex]}
              renderTrack={trackRenderer}
              renderThumb={thumbRenderer}
              onChange={onSliderChange}
            />
          </div>

          <div className={styles.rangeSummary}>
            {translate('SeriesDetailsQualityFilterRange', { minLabel, maxLabel })}
          </div>
        </div>
      </MenuContent>
    </Menu>
  );
}

export default SeriesDetailsQualityFilterMenu;
