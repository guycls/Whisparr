import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
      const minutes = index === 0 ? minMinutes : resolvedMaxMinutes;
      const label = formatRuntimeFilterLabel(minutes);

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

          <Box
            sx={{
              position: 'relative',
              py: 2,
              pb: 1,
              '& .runtime-filter-slider': {
                width: '100%',
                height: 28,
              },
            }}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <ReactSlider
              className="runtime-filter-slider"
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
