import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import React, { useCallback } from 'react';
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

  const formatThumbLabel = useCallback((value: number) => {
    const tier = getQualityFilterTier(value);
    return tier.isUnknown ?
      translate('SeriesDetailsQualityFilterUnknown') :
      formatQualityTierLabel(tier);
  }, []);

  const minTier = getQualityFilterTier(minIndex);
  const maxTier = getQualityFilterTier(maxIndex);
  const minLabel = minTier.isUnknown
    ? translate('SeriesDetailsQualityFilterUnknown')
    : formatQualityTierLabel(minTier);
  const maxLabel = maxTier.isUnknown
    ? translate('SeriesDetailsQualityFilterUnknown')
    : formatQualityTierLabel(maxTier);

  return (
    <Menu alignMenu={align.RIGHT} enforceMaxHeight={false} openOnHover={true}>
      <ToolbarMenuButton
        iconName={icons.HD}
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

          <Box sx={{ px: 1, py: 2 }}>
            <Slider
              min={0}
              max={QUALITY_FILTER_MAX_INDEX}
              step={1}
              disableSwap={true}
              value={[minIndex, maxIndex]}
              valueLabelDisplay="auto"
              valueLabelFormat={formatThumbLabel}
              onChange={(event, value) => {
                void event;
                onSliderChange(value as number[]);
              }}
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
