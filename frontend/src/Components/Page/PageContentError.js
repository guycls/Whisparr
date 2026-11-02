import Box from '@mui/material/Box';
import React from 'react';
import ErrorBoundaryError from 'Components/Error/ErrorBoundaryError';
import translate from 'Utilities/String/translate';
import PageContentBody from './PageContentBody';

function PageContentError(props) {
  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        overflowX: 'hidden',
        width: '100%'
      }}
    >
      <PageContentBody>
        <ErrorBoundaryError
          {...props}
          message={translate('ErrorLoadingPage')}
        />
      </PageContentBody>
    </Box>
  );
}

export default PageContentError;
