import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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

interface SeriesDetailsRuntimeFilterMenuProps {
  runtimeFilter: RuntimeFilter;
  seriesMaxRuntime: number;
  onRuntimeFilterChange(runtimeFilter: RuntimeFilter): void;
}

function SeriesDetailsRuntimeFilterMenu(
  props: SeriesDetailsRuntimeFilterMenuProps
) {
  const { runtimeFilter, seriesMaxRuntime, onRuntimeFilterChange } = props;

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

  const onSliderCommit = useCallback(() => {
    setIsDragging(false);
    onRuntimeFilterChange(draftFilterRef.current);
  }, [onRuntimeFilterChange]);

  const minLabel = formatRuntimeFilterLabel(minMinutes);
  const maxLabel = formatRuntimeFilterLabel(resolvedMaxMinutes);

  return (
    <Menu alignMenu={align.RIGHT} enforceMaxHeight={false}>
      <ToolbarMenuButton
        iconName={icons.FILTER}
        text={translate('Runtime')}
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
            <Box component="span">
              {translate('SeriesDetailsRuntimeFilterUnknown')}
            </Box>
            <Box component="span" sx={{ textAlign: 'right' }}>
              {maxLabel}
            </Box>
          </Box>

          <Box sx={{ px: 1, py: 2 }}>
            <Slider
              min={0}
              max={resolvedMaxRuntime}
              step={sliderStep}
              disabled={resolvedMaxRuntime === 0}
              disableSwap={true}
              value={[minMinutes, resolvedMaxMinutes]}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => formatRuntimeFilterLabel(value)}
              onChange={(event, value) => {
                void event;
                setIsDragging(true);
                onSliderChange(value as number[]);
              }}
              onChangeCommitted={onSliderCommit}
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
            {translate('SeriesDetailsRuntimeFilterRange', {
              minLabel,
              maxLabel,
            })}
          </Typography>
        </Box>
      </MenuContent>
    </Menu>
  );
}

export default SeriesDetailsRuntimeFilterMenu;
