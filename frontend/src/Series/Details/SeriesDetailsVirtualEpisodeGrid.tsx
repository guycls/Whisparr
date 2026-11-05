import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useSelector } from 'react-redux';
import AppState from 'App/State/AppState';
import { EpisodeEntities } from 'Episode/useEpisode';
import EpisodeCardConnector from './EpisodeCardConnector';
import {
  getScrollParent,
  getUnifiedGridColumns,
  getUnifiedGridColumnWidth,
  getUnifiedGridGap,
  getUnifiedGridRowMetrics,
  getVisibleRowRange,
  getWindowPagesForRange,
  UNIFIED_GRID_WINDOW_PAGE_SIZE,
} from './unifiedGridLayout';

interface EpisodeItem {
  id: number;
  title?: string;
}

interface GridGeometry {
  columns: number;
  rowStride: number;
}

interface SeriesDetailsVirtualEpisodeGridProps {
  sceneCount: number;
  orderAnchorId?: number;
  windowPages?: Record<number, EpisodeItem[]>;
  isSmallScreen: boolean;
  isSelectMode?: boolean;
  episodeEntity?: EpisodeEntities;
  bookmarkedIds?: number[];
  onBookmarkPress?(id: number): void;
  onMonitorEpisodePress(
    id: number,
    monitored: boolean,
    options: { shiftKey: boolean }
  ): void;
  onGeometryChange?(geometry: GridGeometry): void;
  onVisiblePagesChange?(pages: number[]): void;
}

interface GridLayout {
  columns: number;
  gap: number;
  imageHeight: number;
  rowContentHeight: number;
  rowStride: number;
  rowCount: number;
  startRow: number;
  endRow: number;
}

const emptyLayout: GridLayout = {
  columns: 1,
  gap: 15,
  imageHeight: 0,
  rowContentHeight: 0,
  rowStride: 0,
  rowCount: 0,
  startRow: 0,
  endRow: 0,
};

function episodeAtIndex(
  windowPages: Record<number, EpisodeItem[]> | undefined,
  index: number
) {
  const page = Math.floor(index / UNIFIED_GRID_WINDOW_PAGE_SIZE) + 1;
  const offset = index % UNIFIED_GRID_WINDOW_PAGE_SIZE;

  return windowPages?.[page]?.[offset] || null;
}

const SeriesDetailsVirtualEpisodeGrid = forwardRef<
  HTMLDivElement,
  SeriesDetailsVirtualEpisodeGridProps
>((props, ref) => {
  const {
    sceneCount,
    orderAnchorId = 0,
    windowPages,
    isSmallScreen,
    isSelectMode = false,
    episodeEntity = 'seriesDetails.unifiedGrid',
    bookmarkedIds = [],
    onBookmarkPress,
    onMonitorEpisodePress,
    onGeometryChange,
    onVisiblePagesChange,
  } = props;

  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down('md'));
  const cardSize = useSelector(
    (state: AppState) => state.seriesDetails.cardSize || 200
  );
  const gridRef = useRef<HTMLDivElement | null>(null);
  const pagesKeyRef = useRef('');
  const [layout, setLayout] = useState<GridLayout>(emptyLayout);
  const bookmarkedIdSet = new Set(bookmarkedIds);

  const setGridRef = useCallback(
    (node: HTMLDivElement | null) => {
      gridRef.current = node;

      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref]
  );

  useEffect(() => {
    const node = gridRef.current;
    const scroller = getScrollParent(node);

    if (!node || !scroller || sceneCount <= 0) {
      return;
    }

    const gridOffset =
      node.getBoundingClientRect().top -
      scroller.getBoundingClientRect().top +
      scroller.scrollTop;

    if (scroller.scrollTop > gridOffset + 1) {
      scroller.scrollTop = gridOffset;
    }
  }, [orderAnchorId, sceneCount]);

  useEffect(() => {
    const node = gridRef.current;
    const scroller = getScrollParent(node);

    if (!node || !scroller) {
      return;
    }

    let frame = 0;

    const update = () => {
      const width = node.clientWidth;
      const gap = getUnifiedGridGap(isCompact);
      const columns = getUnifiedGridColumns(width, cardSize, gap);
      const columnWidth = getUnifiedGridColumnWidth(width, columns, gap);
      const { imageHeight, rowContentHeight, rowStride } =
        getUnifiedGridRowMetrics(columnWidth, gap);
      const rowCount = columns > 0 ? Math.ceil(sceneCount / columns) : 0;
      const gridOffset =
        node.getBoundingClientRect().top -
        scroller.getBoundingClientRect().top +
        scroller.scrollTop;
      const { startRow, endRow } = getVisibleRowRange({
        scrollTop: scroller.scrollTop,
        viewportHeight: scroller.clientHeight,
        gridOffset,
        rowStride,
        rowCount,
      });
      const startIndex = startRow * columns;
      const endIndex = Math.min(sceneCount, endRow * columns);
      const pages = getWindowPagesForRange(
        startIndex,
        endIndex,
        UNIFIED_GRID_WINDOW_PAGE_SIZE
      );
      const pagesKey = pages.join(',');

      if (pagesKey !== pagesKeyRef.current) {
        pagesKeyRef.current = pagesKey;
        onVisiblePagesChange?.(pages);
      }

      onGeometryChange?.({ columns, rowStride });
      setLayout((current) => {
        if (
          current.columns === columns &&
          current.gap === gap &&
          current.imageHeight === imageHeight &&
          current.rowContentHeight === rowContentHeight &&
          current.rowStride === rowStride &&
          current.rowCount === rowCount &&
          current.startRow === startRow &&
          current.endRow === endRow
        ) {
          return current;
        }

        return {
          columns,
          gap,
          imageHeight,
          rowContentHeight,
          rowStride,
          rowCount,
          startRow,
          endRow,
        };
      });
    };

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    const observer = new ResizeObserver(schedule);

    observer.observe(node);
    observer.observe(scroller);
    scroller.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    schedule();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      scroller.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [cardSize, isCompact, onGeometryChange, onVisiblePagesChange, sceneCount]);

  const startIndex = layout.startRow * layout.columns;
  const endIndex = Math.min(sceneCount, layout.endRow * layout.columns);
  const slots = [];

  for (let index = startIndex; index < endIndex; index++) {
    slots.push({
      index,
      episode: episodeAtIndex(windowPages, index),
    });
  }

  return (
    <Box
      ref={setGridRef}
      sx={{
        position: 'relative',
        height:
          layout.rowCount > 0
            ? `${layout.rowCount * layout.rowStride}px`
            : undefined,
      }}
    >
      {layout.rowStride > 0 ? (
        <Box
          sx={{
            position: 'absolute',
            top: `${layout.startRow * layout.rowStride}px`,
            left: 0,
            right: 0,
            display: 'grid',
            gridTemplateColumns: `repeat(${layout.columns}, minmax(0, 1fr))`,
            gap: `${layout.gap}px`,
          }}
        >
          {slots.map((slot) => {
            if (!slot.episode) {
              return (
                <Box
                  key={`placeholder-${slot.index}`}
                  sx={{
                    height: `${layout.rowContentHeight}px`,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    bgcolor: 'action.hover',
                  }}
                />
              );
            }

            return (
              <EpisodeCardConnector
                key={slot.episode.id}
                {...slot.episode}
                isSmallScreen={isSmallScreen}
                isSelectMode={isSelectMode}
                clampTitle={true}
                fixedHeight={layout.rowContentHeight}
                imageHeight={layout.imageHeight}
                episodeEntity={episodeEntity}
                isBookmarked={bookmarkedIdSet.has(slot.episode.id)}
                onBookmarkPress={onBookmarkPress}
                onMonitorEpisodePress={onMonitorEpisodePress}
              />
            );
          })}
        </Box>
      ) : null}
    </Box>
  );
});

export default SeriesDetailsVirtualEpisodeGrid;
