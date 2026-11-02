import Box from '@mui/material/Box';
import React from 'react';
import Label from 'Components/Label';
import DownloadProtocol from 'DownloadClient/DownloadProtocol';

interface ProtocolLabelProps {
  protocol: DownloadProtocol;
}

const protocolColor: Partial<Record<DownloadProtocol, string>> = {
  torrent: 'var(--torrentColor)',
  usenet: 'var(--usenetColor)',
};

function ProtocolLabel({ protocol }: ProtocolLabelProps) {
  const protocolName = protocol === 'usenet' ? 'nzb' : protocol;
  const color = protocolColor[protocol];

  return (
    <Box
      component="span"
      sx={
        color
          ? {
              '& .MuiChip-root': {
                borderColor: color,
                backgroundColor: color,
                color: 'var(--white)',
              },
            }
          : undefined
      }
    >
      <Label>{protocolName}</Label>
    </Box>
  );
}

export default ProtocolLabel;
