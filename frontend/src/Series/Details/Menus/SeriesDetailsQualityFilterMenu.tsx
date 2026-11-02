import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
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

interface QualityFilter {
  minIndex: number;
  maxIndex: number;
}

function getTierLabelAlign(tierPosition: number, tierCount: number) {
  if (tierPosition === 0) {
    return 'left';
  }

  if (tierPosition === tierCount - 1) {
    return 'right';
  }

  return 'center';
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
    (
      trackProps: React.HTMLAttributes<HTMLDivElement>,
      state: { index: number }
    ) => (
      <Box
        {...trackProps}
        sx={{
          top: 11,
          mx: '9px',
          height: 3,
          bgcolor: state.index === 0 ? 'grey.300' : 'primary.main',
          boxShadow: '0 0 0 #000',
        }}
      />
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
      const label = tier.isUnknown
        ? translate('SeriesDetailsQualityFilterUnknown')
        : formatQualityTierLabel(tier);

      return (
        <Box
          {...thumbProps}
          sx={{
            zIndex: 1,
            width: 18,
            height: 18,
            border: 3,
            borderColor: 'primary.main',
            borderRadius: '50%',
            bgcolor: 'common.white',
            cursor: 'pointer',
          }}
        >
          {showEndpointLabels ? (
            <Box
              sx={{
                position: 'absolute',
                top: -24,
                left: '50%',
                transform: 'translateX(-50%)',
                px: '6px',
                py: '2px',
                borderRadius: '3px',
                bgcolor: 'background.paper',
                color: 'text.primary',
                whiteSpace: 'nowrap',
                fontSize: 12,
                pointerEvents: 'none',
              }}
            >
              {label}
            </Box>
          ) : null}
        </Box>
      );
    },
    [minIndex, maxIndex, showEndpointLabels]
  );

  const minTier = getQualityFilterTier(minIndex);
  const maxTier = getQualityFilterTier(maxIndex);
  const minLabel = minTier.isUnknown
    ? translate('SeriesDetailsQualityFilterUnknown')
    : formatQualityTierLabel(minTier);
  const maxLabel = maxTier.isUnknown
    ? translate('SeriesDetailsQualityFilterUnknown')
    : formatQualityTierLabel(maxTier);

  return (
    <Menu alignMenu={align.RIGHT} enforceMaxHeight={false}>
      <ToolbarMenuButton
        iconName={icons.FILTER}
        text={translate('Quality')}
        showIndicator={isFilterActive}
      />

      <MenuContent>
        <Box sx={{ width: 300, p: '12px 16px 16px' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mb: 1,
              color: 'text.secondary',
              fontSize: 12,
            }}
          >
            {QUALITY_FILTER_TIERS.map((tier, tierPosition) => (
              <Box
                component="span"
                key={tier.index}
                sx={{
                  flex: 1,
                  textAlign: getTierLabelAlign(
                    tierPosition,
                    QUALITY_FILTER_TIERS.length
                  ),
                }}
              >
                {tier.isUnknown
                  ? translate('SeriesDetailsQualityFilterUnknown')
                  : formatQualityTierLabel(tier)}
              </Box>
            ))}
          </Box>

          <Box
            sx={{
              position: 'relative',
              py: 2,
              pb: 1,
              '& .quality-filter-slider': {
                width: '100%',
                height: 28,
              },
            }}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <ReactSlider
              className="quality-filter-slider"
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
          </Box>

          <Typography
            sx={{
              mt: 1,
              textAlign: 'center',
              color: 'text.secondary',
              fontSize: 12,
            }}
          >
            {translate('SeriesDetailsQualityFilterRange', {
              minLabel,
              maxLabel,
            })}
          </Typography>
        </Box>
      </MenuContent>
    </Menu>
  );
}

export default SeriesDetailsQualityFilterMenu;
