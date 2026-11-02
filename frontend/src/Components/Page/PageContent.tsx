import Box from '@mui/material/Box';
import React from 'react';
import DocumentTitle from 'react-document-title';
import ErrorBoundary from 'Components/Error/ErrorBoundary';
import PageContentError from './PageContentError';

interface PageContentProps {
  className?: string;
  title?: string;
  children: React.ReactNode;
}

function PageContent(props: PageContentProps) {
  const { className, title, children } = props;

  return (
    <ErrorBoundary errorComponent={PageContentError}>
      <DocumentTitle
        title={
          title
            ? `${title} - ${window.Whisparr.instanceName}`
            : window.Whisparr.instanceName
        }
      >
        <Box
          className={className}
          sx={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            overflowX: 'hidden',
            width: '100%',
            minHeight: 0,
          }}
        >
          {children}
        </Box>
      </DocumentTitle>
    </ErrorBoundary>
  );
}

export default PageContent;
