import Box from '@mui/material/Box';
import { SxProps, Theme } from '@mui/material/styles';
import { throttle } from 'lodash';
import React, {
  ForwardedRef,
  forwardRef,
  MutableRefObject,
  ReactNode,
  useEffect,
  useRef,
} from 'react';
import { ScrollDirection } from 'Helpers/Props/scrollDirections';

export interface OnScroll {
  scrollLeft: number;
  scrollTop: number;
}

interface ScrollerProps {
  className?: string;
  scrollDirection?: ScrollDirection;
  autoFocus?: boolean;
  autoScroll?: boolean;
  scrollTop?: number;
  initialScrollTop?: number;
  children?: ReactNode;
  style?: React.CSSProperties;
  sx?: SxProps<Theme>;
  onScroll?: (payload: OnScroll) => void;
}

const Scroller = forwardRef(
  (props: ScrollerProps, ref: ForwardedRef<HTMLDivElement>) => {
    const {
      className,
      autoFocus = false,
      autoScroll = true,
      scrollDirection = 'vertical',
      children,
      scrollTop,
      initialScrollTop,
      onScroll,
      sx,
      ...otherProps
    } = props;

    const internalRef = useRef<HTMLDivElement>(null);
    const currentRef = (ref as MutableRefObject<HTMLDivElement>) ?? internalRef;

    useEffect(
      () => {
        if (initialScrollTop != null && currentRef.current) {
          currentRef.current.scrollTop = initialScrollTop;
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      []
    );

    useEffect(() => {
      if (!currentRef.current) {
        return;
      }

      if (scrollTop != null) {
        currentRef.current.scrollTop = scrollTop;
      }

      if (autoFocus && scrollDirection !== 'none') {
        currentRef.current.focus({ preventScroll: true });
      }
    }, [autoFocus, currentRef, scrollDirection, scrollTop]);

    useEffect(() => {
      const div = currentRef.current;

      if (!div) {
        return;
      }

      const handleScroll = throttle(() => {
        const scrollLeft = div.scrollLeft;
        const scrollTop = div.scrollTop;

        onScroll?.({ scrollLeft, scrollTop });
      }, 10);

      div.addEventListener('scroll', handleScroll);

      return () => {
        div.removeEventListener('scroll', handleScroll);
      };
    }, [currentRef, onScroll]);

    let overflowX: 'auto' | 'hidden' | 'scroll' = 'hidden';
    let overflowY: 'auto' | 'hidden' | 'scroll' = 'hidden';

    if (scrollDirection === 'vertical') {
      overflowY = autoScroll ? 'auto' : 'scroll';
    } else if (scrollDirection === 'horizontal') {
      overflowX = autoScroll ? 'auto' : 'scroll';
    } else if (scrollDirection === 'both') {
      overflowX = autoScroll ? 'auto' : 'scroll';
      overflowY = autoScroll ? 'auto' : 'scroll';
    }

    return (
      <Box
        {...otherProps}
        ref={currentRef}
        className={className}
        tabIndex={-1}
        sx={[
          {
            WebkitOverflowScrolling: 'touch',
            scrollbarColor: 'var(--scrollbarBackgroundColor) transparent',
            scrollbarWidth: 'thin',
            overflowX,
            overflowY,
            '&::-webkit-scrollbar': {
              width: 10,
              height: 10,
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              minHeight: 100,
              border: '1px solid transparent',
              borderRadius: '5px',
              backgroundColor: 'var(--scrollbarBackgroundColor)',
              backgroundClip: 'padding-box',
              '&:hover': {
                backgroundColor: 'var(--scrollbarHoverBackgroundColor)',
              },
            },
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        {children}
      </Box>
    );
  }
);

export default Scroller;
