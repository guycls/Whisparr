import Box from '@mui/material/Box';
import React from 'react';
import Tooltip, { TooltipProps } from './Tooltip';

interface PopoverProps extends Omit<TooltipProps, 'tooltip' | 'bodyClassName'> {
  title: string;
  body: React.ReactNode;
}

function Popover({ title, body, ...otherProps }: PopoverProps) {
  return (
    <Tooltip
      {...otherProps}
      bodySx={{ p: 0 }}
      tooltip={
        <Box>
          <Box
            sx={(theme) => ({
              padding: '10px 20px',
              borderBottom: `1px solid ${theme.palette.divider}`,
              backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200],
              fontSize: 16,
            })}
          >
            {title}
          </Box>

          <Box
            sx={(theme) => ({
              overflow: 'auto',
              p: '10px',
              backgroundColor: theme.palette.background.paper,
            })}
          >
            {body}
          </Box>
        </Box>
      }
    />
  );
}

export default Popover;
