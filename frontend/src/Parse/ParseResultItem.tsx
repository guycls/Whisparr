import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import React, { ReactNode } from 'react';

interface ParseResultItemProps {
  title: string;
  data: string | number | ReactNode;
}

function ParseResultItem(props: ParseResultItemProps) {
  const { title, data } = props;

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      sx={{ mb: { xs: '10px', md: 0 } }}
    >
      <Typography
        sx={{
          mr: { md: '20px' },
          width: { md: 250 },
          textAlign: { xs: 'left', md: 'right' },
          fontWeight: 'bold',
        }}
      >
        {title}
      </Typography>
      <Box>{data}</Box>
    </Stack>
  );
}

export default ParseResultItem;
