import Box from '@mui/material/Box';
import React, { ComponentPropsWithoutRef, useCallback, useRef } from 'react';
import { Scrollbars } from 'react-custom-scrollbars-2';
import { ScrollDirection } from 'Helpers/Props/scrollDirections';
import { OnScroll } from './Scroller';

const SCROLLBAR_SIZE = 10;

const thumbSx = {
  minHeight: 100,
  border: '1px solid transparent',
  borderRadius: '5px',
  backgroundColor: 'var(--scrollbarBackgroundColor)',
  backgroundClip: 'padding-box',
  '&:hover': {
    backgroundColor: 'var(--scrollbarHoverBackgroundColor)',
  },
};

interface OverlayScrollerProps {
  className?: string;
  trackClassName?: string;
  scrollTop?: number;
  scrollDirection: ScrollDirection;
  autoHide: boolean;
  autoScroll: boolean;
  children?: React.ReactNode;
  onScroll?: (payload: OnScroll) => void;
}

interface ScrollbarTrackProps {
  style: React.CSSProperties;
  props: ComponentPropsWithoutRef<'div'>;
}

function OverlayScroller(props: OverlayScrollerProps) {
  const {
    autoHide = false,
    autoScroll = true,
    className,
    trackClassName,
    children,
    onScroll,
  } = props;
  const scrollBarRef = useRef<Scrollbars>(null);
  const isScrolling = useRef(false);

  const handleScrollStart = useCallback(() => {
    isScrolling.current = true;
  }, []);
  const handleScrollStop = useCallback(() => {
    isScrolling.current = false;
  }, []);

  const handleScroll = useCallback(() => {
    if (!scrollBarRef.current) {
      return;
    }

    const { scrollTop, scrollLeft } = scrollBarRef.current.getValues();
    isScrolling.current = true;

    if (onScroll) {
      onScroll({ scrollTop, scrollLeft });
    }
  }, [onScroll]);

  const renderThumb = useCallback(
    (thumbProps: ComponentPropsWithoutRef<'div'>) => {
      return (
        <Box className={trackClassName} sx={thumbSx} {...thumbProps} />
      );
    },
    [trackClassName]
  );

  const renderTrackHorizontal = useCallback(
    ({ style, props: trackProps }: ScrollbarTrackProps) => {
      const finalStyle = {
        ...style,
        right: 2,
        bottom: 2,
        left: 2,
        borderRadius: 3,
        height: SCROLLBAR_SIZE,
      };

      return <Box style={finalStyle} {...trackProps} />;
    },
    []
  );

  const renderTrackVertical = useCallback(
    ({ style, props: trackProps }: ScrollbarTrackProps) => {
      const finalStyle = {
        ...style,
        right: 2,
        bottom: 2,
        top: 2,
        borderRadius: 3,
        width: SCROLLBAR_SIZE,
      };

      return <Box style={finalStyle} {...trackProps} />;
    },
    []
  );

  const renderView = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (viewProps: any) => {
      return <Box className={className} {...viewProps} />;
    },
    [className]
  );

  return (
    <Scrollbars
      ref={scrollBarRef}
      autoHide={autoHide}
      hideTracksWhenNotNeeded={autoScroll}
      renderTrackHorizontal={renderTrackHorizontal}
      renderTrackVertical={renderTrackVertical}
      renderThumbHorizontal={renderThumb}
      renderThumbVertical={renderThumb}
      renderView={renderView}
      onScrollStart={handleScrollStart}
      onScrollStop={handleScrollStop}
      onScroll={handleScroll}
    >
      {children}
    </Scrollbars>
  );
}

export default OverlayScroller;
