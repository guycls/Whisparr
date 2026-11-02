import Box from '@mui/material/Box';
import React from 'react';
import PageContent from 'Components/Page/PageContent';
import translate from 'Utilities/String/translate';

interface NotFoundProps {
  message?: string;
}

function NotFound(props: NotFoundProps) {
  const { message = translate('DefaultNotFoundMessage') } = props;

  return (
    <PageContent title="MIA">
      <Box sx={{ textAlign: 'center' }}>
        <Box
          sx={{
            my: '50px',
            textAlign: 'center',
            fontWeight: 300,
            fontSize: 36,
          }}
        >
          {message}
        </Box>

        <Box
          component="img"
          src={`${window.Whisparr.urlBase}/Content/Images/404.png`}
          sx={{ height: 350 }}
        />
      </Box>
    </PageContent>
  );
}

export default NotFound;
