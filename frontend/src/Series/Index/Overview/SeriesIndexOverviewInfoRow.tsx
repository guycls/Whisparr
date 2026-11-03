import Box from '@mui/material/Box';
import React from 'react';
import Icon from 'Components/Icon';
import type { IconName } from 'Helpers/Props/icons';

interface SeriesIndexOverviewInfoRowProps {
  title?: string;
  iconName?: IconName;
  label: string | null;
}

function SeriesIndexOverviewInfoRow(props: SeriesIndexOverviewInfoRowProps) {
  const { title, iconName, label } = props;

  if (!iconName) {
    return null;
  }

  return (
    <Box
      title={title}
      sx={{
        flex: '0 0 21px',
        my: '2px',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Box
        component="span"
        sx={{ mr: '5px', width: 25, textAlign: 'center', flexShrink: 0 }}
      >
        <Icon name={iconName} size={14} />
      </Box>

      {label}
    </Box>
  );
}

export default SeriesIndexOverviewInfoRow;
