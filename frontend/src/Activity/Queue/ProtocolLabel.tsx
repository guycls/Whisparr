import Box from '@mui/material/Box';
import React from 'react';
import Label from 'Components/Label';
import DownloadProtocol from 'DownloadClient/DownloadProtocol';

interface ProtocolLabelProps {
  protocol: DownloadProtocol;
}

function ProtocolLabel({ protocol }: ProtocolLabelProps) {
  const protocolName = protocol === 'usenet' ? 'nzb' : protocol;

  const chipColor = protocol === 'torrent' || protocol === 'usenet';

  return (
    <Box
      component="span"
      sx={
        chipColor ?
          (theme) => ({
            '& .MuiChip-root': {
              borderColor: protocol === 'torrent' ? theme.palette.success.main : theme.palette.info.main,
              backgroundColor: protocol === 'torrent' ? theme.palette.success.main : theme.palette.info.main,
              color: theme.palette.common.white,
            },
          }) :
          undefined
      }
    >
      <Label>{protocolName}</Label>
    </Box>
  );
}

export default ProtocolLabel;
