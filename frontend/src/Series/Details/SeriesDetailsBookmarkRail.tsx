import Box from '@mui/material/Box';
import React, {
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import translate from 'Utilities/String/translate';
import { getScrollParent } from './unifiedGridLayout';

interface BookmarkMarker {
  id: number;
  top: number;
  title: string;
}

interface RailRect {
  top: number;
  height: number;
  right: number;
}

interface SceneOrderEntry {
  id: number;
  title?: string;
}

interface SeriesDetailsBookmarkRailProps {
  anchorRef: RefObject<HTMLElement | null>;
  episodeIds: number[];
  sceneOrder: SceneOrderEntry[];
  columns: number;
  rowStride: number;
}

function SeriesDetailsBookmarkRail(props: SeriesDetailsBookmarkRailProps) {
  const { anchorRef, episodeIds, sceneOrder, columns, rowStride } = props;
  const [rail, setRail] = useState<RailRect | null>(null);
  const [markers, setMarkers] = useState<BookmarkMarker[]>([]);
  const railRef = useRef<RailRect | null>(null);
  const markersRef = useRef<BookmarkMarker[]>([]);
  const episodeIdsRef = useRef(episodeIds);
  const sceneOrderRef = useRef(sceneOrder);
  const columnsRef = useRef(columns);
  const rowStrideRef = useRef(rowStride);

  episodeIdsRef.current = episodeIds;
  sceneOrderRef.current = sceneOrder;
  columnsRef.current = columns;
  rowStrideRef.current = rowStride;

  const measure = useCallback(() => {
    const anchor = anchorRef.current;
    const scroller = getScrollParent(anchor);
    const columnCount = columnsRef.current;
    const stride = rowStrideRef.current;

    if (!anchor || !scroller || columnCount < 1 || stride <= 0) {
      return;
    }

    const scrollerRect = scroller.getBoundingClientRect();
    const nextRail: RailRect = {
      top: scrollerRect.top,
      height: scrollerRect.height,
      right: Math.max(0, window.innerWidth - scrollerRect.right),
    };
    const previousRail = railRef.current;

    if (
      !previousRail ||
      Math.abs(previousRail.top - nextRail.top) > 0.5 ||
      Math.abs(previousRail.height - nextRail.height) > 0.5 ||
      Math.abs(previousRail.right - nextRail.right) > 0.5
    ) {
      railRef.current = nextRail;
      setRail(nextRail);
    }

    const scrollHeight = scroller.scrollHeight;
    const gridOffset =
      anchor.getBoundingClientRect().top -
      scrollerRect.top +
      scroller.scrollTop;
    const orderIndex = new Map(
      sceneOrderRef.current.map((entry, index) => [entry.id, index])
    );
    const nextMarkers: BookmarkMarker[] = [];

    if (scrollHeight > 0) {
      episodeIdsRef.current.forEach((id) => {
        const index = orderIndex.get(id);

        if (index == null) {
          return;
        }

        const row = Math.floor(index / columnCount);
        const contentY = gridOffset + row * stride;
        const top = Math.min(100, Math.max(0, (contentY / scrollHeight) * 100));
        const entry = sceneOrderRef.current[index];

        nextMarkers.push({
          id,
          top,
          title: entry?.title || translate('Scene'),
        });
      });
    }

    const previousMarkers = markersRef.current;
    const markersChanged =
      previousMarkers.length !== nextMarkers.length ||
      nextMarkers.some((marker, index) => {
        const previous = previousMarkers[index];

        return (
          !previous ||
          previous.id !== marker.id ||
          Math.abs(previous.top - marker.top) > 0.05 ||
          previous.title !== marker.title
        );
      });

    if (markersChanged) {
      markersRef.current = nextMarkers;
      setMarkers(nextMarkers);
    }
  }, [anchorRef]);

  useEffect(() => {
    const anchor = anchorRef.current;
    const scroller = getScrollParent(anchor);

    if (!anchor || !scroller) {
      return;
    }

    let frame = 0;

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };

    const observer = new ResizeObserver(schedule);

    observer.observe(scroller);
    observer.observe(anchor);
    scroller.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    schedule();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      scroller.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [anchorRef, columns, episodeIds, measure, rowStride, sceneOrder]);

  const onMarkerClick = (episodeId: number) => {
    const anchor = anchorRef.current;
    const scroller = getScrollParent(anchor);
    const index = sceneOrder.findIndex((entry) => entry.id === episodeId);

    if (!anchor || !scroller || index < 0 || columns < 1 || rowStride <= 0) {
      return;
    }

    const scrollerRect = scroller.getBoundingClientRect();
    const gridOffset =
      anchor.getBoundingClientRect().top -
      scrollerRect.top +
      scroller.scrollTop;
    const row = Math.floor(index / columns);
    const top = Math.max(0, gridOffset + row * rowStride);
    const distance = Math.abs(top - scroller.scrollTop);

    scroller.scrollTo({
      top,
      behavior: distance > scroller.clientHeight ? 'auto' : 'smooth',
    });
  };

  if (!rail || !markers.length) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: rail.top,
        height: rail.height,
        right: rail.right,
        width: 10,
        zIndex: 4,
        pointerEvents: 'none',
      }}
    >
      {markers.map((marker) => {
        return (
          <Box
            key={marker.id}
            component="button"
            type="button"
            title={marker.title}
            aria-label={translate('ScrollToBookmarkedScene', {
              title: marker.title,
            })}
            onClick={() => onMarkerClick(marker.id)}
            sx={{
              position: 'absolute',
              left: 0,
              width: '100%',
              height: 10,
              mt: '-5px',
              top: `${marker.top}%`,
              p: 0,
              border: 0,
              backgroundColor: 'transparent',
              cursor: 'pointer',
              pointerEvents: 'auto',
              '&::before': {
                content: '""',
                position: 'absolute',
                left: 0,
                right: 0,
                top: 3,
                height: 3,
                borderRadius: '1px',
                backgroundColor: 'primary.main',
              },
            }}
          />
        );
      })}
    </Box>
  );
}

export default SeriesDetailsBookmarkRail;
