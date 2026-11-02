import Box from '@mui/material/Box';
import React, { ForwardedRef, forwardRef, ReactNode, useCallback } from 'react';
import Scroller, { OnScroll } from 'Components/Scroller/Scroller';
import { isLocked } from 'Utilities/scrollLock';

interface PageContentBodyProps {
  className?: string;
  innerClassName?: string;
  children: ReactNode;
  initialScrollTop?: number;
  onScroll?: (payload: OnScroll) => void;
}

const PageContentBody = forwardRef(
  (props: PageContentBodyProps, ref: ForwardedRef<HTMLDivElement>) => {
    const {
      className,
      innerClassName,
      children,
      onScroll,
      ...otherProps
    } = props;

    const onScrollWrapper = useCallback(
      (payload: OnScroll) => {
        if (onScroll && !isLocked()) {
          onScroll(payload);
        }
      },
      [onScroll]
    );

    return (
      <Scroller
        ref={ref}
        {...otherProps}
        className={className}
        scrollDirection="vertical"
        onScroll={onScrollWrapper}
      >
        <Box
          className={innerClassName}
          sx={{ p: { xs: 1.25, md: 2.5 } }}
        >
          {children}
        </Box>
      </Scroller>
    );
  }
);

export default PageContentBody;
