import Box from '@mui/material/Box';
import { SxProps, Theme } from '@mui/material/styles';
import React, { useEffect, useState } from 'react';
import StackTrace from 'stacktrace-js';
import translate from 'Utilities/String/translate';

interface ErrorBoundaryErrorProps {
  className?: string;
  messageClassName?: string;
  detailsClassName?: string;
  messageSx?: SxProps<Theme>;
  detailsSx?: SxProps<Theme>;
  message?: string;
  error: Error;
  info: {
    componentStack: string;
  };
}

function ErrorBoundaryError(props: ErrorBoundaryErrorProps) {
  const {
    className,
    messageClassName,
    detailsClassName,
    messageSx,
    detailsSx,
    message = translate('ErrorLoadingContent'),
    error,
    info,
  } = props;

  const [detailedError, setDetailedError] = useState<
    StackTrace.StackFrame[] | null
  >(null);

  useEffect(() => {
    if (error) {
      StackTrace.fromError(error).then((de) => {
        setDetailedError(de);
      });
    } else {
      setDetailedError(null);
    }
  }, [error, setDetailedError]);

  return (
    <Box className={className} sx={{ textAlign: 'center' }}>
      <Box
        className={messageClassName}
        sx={[
          {
            my: '50px',
            textAlign: 'center',
            fontWeight: 300,
            fontSize: 36,
          },
          ...(Array.isArray(messageSx) ? messageSx : [messageSx]),
        ]}
      >
        {message}
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          flex: '0 0 auto',
        }}
      >
        <Box
          component="img"
          src={`${window.Whisparr.urlBase}/Content/Images/error.png`}
          sx={{
            height: 350,
            '@media (max-width: 992px)': {
              height: 250,
            },
            '@media (max-width: 768px)': {
              height: 150,
            },
          }}
        />
      </Box>

      <Box
        className={detailsClassName}
        component="details"
        sx={[
          {
            m: '20px',
            textAlign: 'left',
            whiteSpace: 'pre-wrap',
          },
          ...(Array.isArray(detailsSx) ? detailsSx : [detailsSx]),
        ]}
      >
        {error ? <div>{error.message}</div> : null}

        {detailedError ? (
          detailedError.map((d, index) => {
            return (
              <div key={index}>
                {`  at ${d.functionName} (${d.fileName}:${d.lineNumber}:${d.columnNumber})`}
              </div>
            );
          })
        ) : (
          <div>{info.componentStack}</div>
        )}

        <Box sx={{ mt: '20px' }}>Version: {window.Whisparr.version}</Box>
      </Box>
    </Box>
  );
}

export default ErrorBoundaryError;
