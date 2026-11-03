import Box from '@mui/material/Box';
import { SxProps, Theme } from '@mui/material/styles';
import MuiTooltip from '@mui/material/Tooltip';
import React, { useState } from 'react';
import { kinds, tooltipPositions } from 'Helpers/Props';
import { Kind } from 'Helpers/Props/kinds';
import { TooltipPosition } from 'Helpers/Props/tooltipPositions';
import { isMobile as isMobileUtil } from 'Utilities/browser';

export interface TooltipProps {
  className?: string;
  bodyClassName?: string;
  bodySx?: SxProps<Theme>;
  anchor: React.ReactNode;
  tooltip: string | React.ReactNode;
  kind?: Kind;
  position?: TooltipPosition;
  canFlip?: boolean;
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

  const mobile = isMobileUtil();
  const [open, setOpen] = useState(false);
  const inverse = kind === kinds.INVERSE;
  const bodyStyles = Array.isArray(bodySx) ? bodySx : [bodySx];

  return (
    <MuiTooltip
      arrow={true}
      placement={position}
      open={mobile ? open : undefined}
      disableHoverListener={mobile}
      disableFocusListener={mobile}
      disableTouchListener={true}
      disableInteractive={false}
      enterDelay={200}
      onClose={() => setOpen(false)}
      slotProps={{
        popper: {
          modifiers: [
            {
              name: 'flip',
              enabled: canFlip,
            },
          ],
        },
        tooltip: {
          sx: (theme) => ({
            maxWidth: 480,
            padding: 0,
            backgroundColor: inverse ? theme.palette.grey[700] : theme.palette.background.paper,
            color: inverse ? theme.palette.common.white : theme.palette.text.primary,
            boxShadow: theme.shadows[3],
            fontSize: theme.typography.body2.fontSize,
          }),
        },
        arrow: {
          sx: (theme) => ({
            color: inverse ? theme.palette.grey[700] : theme.palette.background.paper,
          }),
        },
      }}
      title={
        <Box className={bodyClassName} sx={[{ p: '5px' }, ...bodyStyles]}>
          {tooltip}
        </Box>
      }
    >
      <Box
        className={className}
        component="span"
        onClick={mobile ? () => setOpen((value) => !value) : undefined}
        sx={{ display: 'inline-flex', maxWidth: '100%' }}
      >
        {anchor}
      </Box>
    </MuiTooltip>
  );
}

export default Tooltip;
