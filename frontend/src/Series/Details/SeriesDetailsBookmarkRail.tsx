import Box from '@mui/material/Box';
import React, {
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import translate from 'Utilities/String/translate';

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

interface SeriesDetailsBookmarkRailProps {
  anchorRef: RefObject<HTMLElement | null>;
  episodeIds: number[];
  itemCount: number;
}

function getScrollParent(node: HTMLElement | null): HTMLElement | null {
  let current = node?.parentElement ?? null;

  while (current) {
    const { overflowY } = window.getComputedStyle(current);

    if (
      overflowY === 'auto' ||
      overflowY === 'scroll' ||
      overflowY === 'overlay'
    ) {
      return current;
    }

    current = current.parentElement;
  }

  return null;
}

function findCard(scroller: HTMLElement, episodeId: number) {
  const card = scroller.querySelector(`[data-episode-id="${episodeId}"]`);

  return card instanceof HTMLElement ? card : null;
}

function scrollCardToTop(scroller: HTMLElement, card: HTMLElement) {
  const scrollerRect = scroller.getBoundingClientRect();
  const cardRect = card.getBoundingClientRect();
  const top = cardRect.top - scrollerRect.top + scroller.scrollTop;

  scroller.scrollTo({
    top: Math.max(0, top),
    behavior: 'smooth',
  });
}

function SeriesDetailsBookmarkRail(props: SeriesDetailsBookmarkRailProps) {
  const { anchorRef, episodeIds, itemCount } = props;
  const [rail, setRail] = useState<RailRect | null>(null);
  const [markers, setMarkers] = useState<BookmarkMarker[]>([]);
  const pendingEpisodeIdRef = useRef<number | null>(null);
  const railRef = useRef<RailRect | null>(null);
  const markersRef = useRef<BookmarkMarker[]>([]);
  const episodeIdsRef = useRef(episodeIds);

  episodeIdsRef.current = episodeIds;

  const measure = useCallback(() => {
    const anchor = anchorRef.current;
    const scroller = getScrollParent(anchor);

    if (!anchor || !scroller) {
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
    const nextMarkers: BookmarkMarker[] = [];

    if (scrollHeight > 0) {
      episodeIdsRef.current.forEach((id) => {
        const card = findCard(scroller, id);

        if (!card) {
          return;
        }

        const cardRect = card.getBoundingClientRect();
        const contentY = cardRect.top - scrollerRect.top + scroller.scrollTop;
        const top = Math.min(100, Math.max(0, (contentY / scrollHeight) * 100));

        nextMarkers.push({
          id,
          top,
          title: card.dataset.episodeTitle || translate('Scene'),
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

    const pendingId = pendingEpisodeIdRef.current;

    if (pendingId != null) {
      const card = findCard(scroller, pendingId);

      if (card) {
        pendingEpisodeIdRef.current = null;
        scrollCardToTop(scroller, card);
      }
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
  }, [anchorRef, episodeIds, itemCount, measure]);

  const onMarkerClick = (episodeId: number) => {
    const scroller = getScrollParent(anchorRef.current);
    const card = scroller ? findCard(scroller, episodeId) : null;

    if (!scroller || !card) {
      pendingEpisodeIdRef.current = episodeId;
      return;
    }

    pendingEpisodeIdRef.current = null;
    scrollCardToTop(scroller, card);
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
