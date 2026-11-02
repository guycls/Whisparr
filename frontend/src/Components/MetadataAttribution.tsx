import Box from '@mui/material/Box';
import React from 'react';
import Link from 'Components/Link/Link';
import translate from 'Utilities/String/translate';

export default function MetadataAttribution() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 'auto' }}>
      <Link
        to="/settings/metadatasource"
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          mt: 'auto',
          color: 'var(--mediumGray)',
          fontSize: 14,
          '&:hover': {
            color: 'var(--darkGray)',
            textDecoration: 'none',
          },
        }}
      >
        {translate('MetadataProvidedBy', { provider: 'ThePornDB' })}
      </Link>
    </Box>
  );
}
