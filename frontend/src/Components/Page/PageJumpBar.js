import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import React, { useCallback, useRef, useState } from 'react';

function letterFromPointer(order, rail, clientY) {
  const bounds = rail.getBoundingClientRect();

  if (bounds.height <= 0) {
    return order[0];
  }

  const ratio = (clientY - bounds.top) / bounds.height;
  const index = Math.min(
    order.length - 1,
    Math.max(0, Math.floor(ratio * order.length))
  );

  return order[index];
}

function PageJumpBar(props) {
  const { items, minimumItems, onItemPress } = props;
  const order = items && items.order ? items.order : [];
  const railRef = useRef(null);
  const activeRef = useRef(null);
  const [active, setActive] = useState(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const selectLetter = useCallback(
    (letter) => {
      setActive(letter);

      if (letter && letter !== activeRef.current) {
        activeRef.current = letter;
        onItemPress(letter);
      }
    },
    [onItemPress]
  );

  const handlePointerDown = useCallback(
    (event) => {
      if (!railRef.current) {
        return;
      }

      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      setIsScrubbing(true);
      selectLetter(letterFromPointer(order, railRef.current, event.clientY));
    },
    [order, selectLetter]
  );

  const handlePointerMove = useCallback(
    (event) => {
      if (!railRef.current) {
        return;
      }

      const letter = letterFromPointer(order, railRef.current, event.clientY);
      const scrubbing = event.currentTarget.hasPointerCapture(event.pointerId);

      if (scrubbing) {
        selectLetter(letter);
        return;
      }

      setActive(letter);
    },
    [order, selectLetter]
  );

  const handlePointerUp = useCallback((event) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    setIsScrubbing(false);
    activeRef.current = null;
  }, []);

  const handlePointerLeave = useCallback(() => {
    setIsHovering(false);

    if (!isScrubbing) {
      setActive(null);
      activeRef.current = null;
    }
  }, [isScrubbing]);

  if (!order.length || order.length < minimumItems) {
    return null;
  }

  const activeIndex = active ? order.indexOf(active) : -1;
  const showBubble = activeIndex >= 0 && (isHovering || isScrubbing);

  return (
    <Box
      ref={railRef}
      sx={{
        position: 'absolute',
        top: 10,
        right: 2,
        bottom: 18,
        py: '4px',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: 22,
        opacity: isHovering || isScrubbing ? 1 : 0.4,
        transition: 'opacity 120ms linear',
        touchAction: 'none',
        userSelect: 'none',
        '@media (max-width: 767.95px)': {
          display: 'none',
        },
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerEnter={(event) => {
        setIsHovering(true);

        if (railRef.current) {
          setActive(letterFromPointer(order, railRef.current, event.clientY));
        }
      }}
      onPointerLeave={handlePointerLeave}
    >
      {order.map((item) => {
        const isActive = item === active;

        return (
          <Box
            key={item}
            component="span"
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: '1 1 auto',
              minHeight: 14,
              color: isActive ? 'primary.main' : 'text.secondary',
              fontSize: 11,
              fontWeight: 700,
              lineHeight: 1.3,
              cursor: 'pointer',
            }}
          >
            {item.toUpperCase()}
          </Box>
        );
      })}

      {showBubble ? (
        <Box
          sx={{
            position: 'absolute',
            right: '100%',
            top: `clamp(18px, ${((activeIndex + 0.5) / order.length) * 100}%, calc(100% - 18px))`,
            transform: 'translate(-8px, -50%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: '50%',
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            fontSize: 16,
            fontWeight: 700,
            pointerEvents: 'none',
          }}
        >
          {active.toUpperCase()}
        </Box>
      ) : null}
    </Box>
  );
}

PageJumpBar.propTypes = {
  items: PropTypes.object.isRequired,
  minimumItems: PropTypes.number.isRequired,
  onItemPress: PropTypes.func.isRequired,
};

PageJumpBar.defaultProps = {
  minimumItems: 5,
};

export default PageJumpBar;
