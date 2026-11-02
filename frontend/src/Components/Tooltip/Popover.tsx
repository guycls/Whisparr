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
            sx={{
              padding: '10px 20px',
              borderBottom: '1px solid var(--popoverTitleBorderColor)',
              backgroundColor: 'var(--popoverTitleBackgroundColor)',
              fontSize: 16,
            }}
          >
            {title}
          </Box>

          <Box
            sx={{
              overflow: 'auto',
              p: '10px',
              backgroundColor: 'var(--popoverBodyBackgroundColor)',
            }}
          >
            {body}
          </Box>
        </Box>
      }
    />
  );
}

export default Popover;
