import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import React from 'react';
import formatBytes from 'Utilities/Number/formatBytes';
import translate from 'Utilities/String/translate';

interface SeasonInfoProps {
  totalEpisodeCount: number;
  monitoredEpisodeCount: number;
  episodeFileCount: number;
  sizeOnDisk: number;
}

interface SeasonInfoRowProps {
  title: string;
  data: React.ReactNode;
}

function SeasonInfoRow({ title, data }: SeasonInfoRowProps) {
  return (
    <Box>
      <Typography
        component="div"
        sx={{
          fontWeight: 'bold',
          lineHeight: 1.528571429,
          width: { md: 90 },
          textAlign: { md: 'right' },
          float: { md: 'left' },
          clear: { md: 'left' },
          overflow: { md: 'hidden' },
          textOverflow: { md: 'ellipsis' },
          whiteSpace: { md: 'nowrap' },
        }}
      >
        {title}
      </Typography>
      <Typography
        component="div"
        sx={{
          lineHeight: 1.528571429,
          overflowWrap: 'break-word',
          ml: { xs: 0, md: '110px' },
        }}
      >
        {data}
      </Typography>
    </Box>
  );
}

function SeasonInfo({
  totalEpisodeCount,
  monitoredEpisodeCount,
  episodeFileCount,
  sizeOnDisk,
}: SeasonInfoProps) {
  return (
    <Box component="dl" sx={{ m: 0 }}>
      <SeasonInfoRow title={translate('Total')} data={totalEpisodeCount} />
      <SeasonInfoRow
        title={translate('Monitored')}
        data={monitoredEpisodeCount}
      />
      <SeasonInfoRow title={translate('WithFiles')} data={episodeFileCount} />
      <SeasonInfoRow
        title={translate('SizeOnDisk')}
        data={formatBytes(sizeOnDisk)}
      />
    </Box>
  );
}

export default SeasonInfo;
