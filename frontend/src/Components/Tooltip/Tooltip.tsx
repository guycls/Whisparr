import Box from '@mui/material/Box';
import { SxProps, Theme } from '@mui/material/styles';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Manager, Popper, Reference } from 'react-popper';
import Portal from 'Components/Portal';
import { kinds, tooltipPositions } from 'Helpers/Props';
import { Kind } from 'Helpers/Props/kinds';
import { isMobile as isMobileUtil } from 'Utilities/browser';

export interface TooltipProps {
  className?: string;
  bodyClassName?: string;
  bodySx?: SxProps<Theme>;
  anchor: React.ReactNode;
  tooltip: string | React.ReactNode;
  kind?: Kind;
  position?: (typeof tooltipPositions.all)[number];
  canFlip?: boolean;
}

function arrowSx(placement: string, kind?: Kind): SxProps<Theme> {
  const color =
    kind === kinds.INVERSE
      ? 'var(--popoverArrowBorderInverseColor)'
      : 'var(--popoverArrowBorderColor)';

  const after = {
    position: 'absolute',
    display: 'block',
    width: 0,
    height: 0,
    borderWidth: '10px',
    borderStyle: 'solid',
    borderColor: 'transparent',
    content: '""',
  };

  const base = {
    position: 'absolute',
    display: 'block',
    width: 0,
    height: 0,
    borderWidth: '11px',
    borderStyle: 'solid',
    borderColor: 'transparent',
  };

  if (placement === 'bottom') {
    return {
      ...base,
      top: -11,
      marginLeft: '-11px',
      borderTopWidth: 0,
      borderBottomColor: color,
      '&::after': {
        ...after,
        top: 1,
        marginLeft: '-10px',
        borderTopWidth: 0,
        borderBottomColor: color,
      },
    };
  }

  if (placement === 'left') {
    return {
      ...base,
      right: -11,
      marginTop: '-11px',
      borderRightWidth: 0,
      borderLeftColor: color,
      '&::after': {
        ...after,
        right: 1,
        bottom: -10,
        borderRightWidth: 0,
        borderLeftColor: color,
      },
    };
  }

  if (placement === 'right') {
    return {
      ...base,
      left: -11,
      marginTop: '-11px',
      borderLeftWidth: 0,
      borderRightColor: color,
      '&::after': {
        ...after,
        bottom: -10,
        left: 1,
        borderLeftWidth: 0,
        borderRightColor: color,
      },
    };
  }

  return {
    ...base,
    bottom: -11,
    marginLeft: '-11px',
    borderBottomWidth: 0,
    borderTopColor: color,
    '&::after': {
      ...after,
      bottom: 1,
      marginLeft: '-10px',
      borderBottomWidth: 0,
      borderTopColor: color,
    },
  };
}

function Tooltip(props: TooltipProps) {
  const {
    className,
    bodyClassName,
    bodySx,
    anchor,
    tooltip,
    kind = kinds.DEFAULT,
    position = tooltipPositions.TOP,
    canFlip = false,
  } = props;

  const closeTimeout = useRef<ReturnType<typeof setTimeout>>();
  const updater = useRef<(() => void) | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = useCallback(() => {
    if (!isMobileUtil()) {
      return;
    }

    setIsOpen((isOpen) => {
      return !isOpen;
    });
  }, [setIsOpen]);

  const handleMouseEnterAnchor = useCallback(() => {
    // Mobile will fire mouse enter and click events rapidly,
    // this causes the tooltip not to open on the first press.
    // Ignore the mouse enter event on mobile.

    if (isMobileUtil()) {
      return;
    }

    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
    }

    setIsOpen(true);
  }, [setIsOpen]);

  const handleMouseEnterTooltip = useCallback(() => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
    }

    setIsOpen(true);
  }, [setIsOpen]);

  const handleMouseLeave = useCallback(() => {
    // Still listen for mouse leave on mobile to allow clicks outside to close the tooltip.

    clearTimeout(closeTimeout.current);
    closeTimeout.current = setTimeout(() => {
      setIsOpen(false);
    }, 100);
  }, [setIsOpen]);

  const maxWidth = useMemo(() => {
    const windowWidth = window.innerWidth;

    if (windowWidth >= parseInt('1200px')) {
      return 800;
    } else if (windowWidth >= parseInt('992px')) {
      return 650;
    } else if (windowWidth >= parseInt('768px')) {
      return 500;
    }

    return 450;
  }, []);

  const computeMaxSize = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (data: any) => {
      const { top, right, bottom, left } = data.offsets.reference;

      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      if (/^top/.test(data.placement)) {
        data.styles.maxHeight = top - 20;
      } else if (/^bottom/.test(data.placement)) {
        data.styles.maxHeight = windowHeight - bottom - 20;
      } else if (/^right/.test(data.placement)) {
        data.styles.maxWidth = Math.min(maxWidth, windowWidth - right - 20);
        data.styles.maxHeight = top - 20;
      } else {
        data.styles.maxWidth = Math.min(maxWidth, left - 20);
        data.styles.maxHeight = top - 20;
      }

      return data;
    },
    [maxWidth]
  );

  useEffect(() => {
    if (updater.current && isOpen) {
      updater.current();
    }
  });

  useEffect(() => {
    return () => {
      if (closeTimeout.current) {
        clearTimeout(closeTimeout.current);
      }
    };
  }, []);

  const inverse = kind === kinds.INVERSE;

  return (
    <Manager>
      <Reference>
        {({ ref }) => (
          <Box
            ref={ref}
            className={className}
            component="span"
            onClick={handleClick}
            onMouseEnter={handleMouseEnterAnchor}
            onMouseLeave={handleMouseLeave}
          >
            {anchor}
          </Box>
        )}
      </Reference>

      <Portal>
        <Popper
          // @ts-expect-error - PopperJS types are not in sync with our position types.
          placement={position}
          // Disable events to improve performance when many tooltips
          // are shown (Quality Definitions for example).
          eventsEnabled={false}
          modifiers={{
            computeMaxHeight: {
              order: 851,
              enabled: true,
              fn: computeMaxSize,
            },
            preventOverflow: {
              // Fixes positioning for tooltips in the queue
              // and likely others.
              escapeWithReference: false,
            },
            flip: {
              enabled: canFlip,
            },
          }}
        >
          {({ ref, style, placement, arrowProps, scheduleUpdate }) => {
            updater.current = scheduleUpdate;

            const popperPlacement = placement
              ? placement.split('-')[0]
              : position;
            const vertical =
              popperPlacement === 'top' || popperPlacement === 'bottom';

            return (
              <Box
                ref={ref}
                style={style}
                sx={{
                  zIndex: 2000,
                  m: '10px',
                  maxHeight: vertical ? 300 : undefined,
                  maxWidth: vertical ? undefined : 'calc(480px - 20px)',
                  '@media (min-width: 480px)': vertical
                    ? undefined
                    : { maxWidth: 'calc(768px * 0.8)' },
                  '@media (min-width: 768px)': vertical
                    ? undefined
                    : { maxWidth: 'calc(992px * 0.8)' },
                  '@media (min-width: 992px)': vertical
                    ? undefined
                    : { maxWidth: 'calc(1200px * 0.8)' },
                }}
                onMouseEnter={handleMouseEnterTooltip}
                onMouseLeave={handleMouseLeave}
              >
                <Box
                  ref={arrowProps.ref}
                  style={arrowProps.style}
                  sx={
                    isOpen ? arrowSx(popperPlacement, kind) : { display: 'none' }
                  }
                />
                {isOpen ? (
                  <Box
                    sx={{
                      position: 'relative',
                      backgroundColor: inverse
                        ? 'var(--themeDarkColor)'
                        : 'var(--popoverBodyBackgroundColor)',
                      boxShadow: inverse
                        ? '0 5px 10px var(--popoverShadowInverseColor)'
                        : '0 5px 10px var(--popoverShadowColor)',
                      color: inverse ? 'var(--white)' : undefined,
                    }}
                  >
                    <Box
                      className={bodyClassName}
                      sx={[{ p: '5px' }, ...(Array.isArray(bodySx) ? bodySx : [bodySx])]}
                    >
                      {tooltip}
                    </Box>
                  </Box>
                ) : null}
              </Box>
            );
          }}
        </Popper>
      </Portal>
    </Manager>
  );
}

export default Tooltip;
