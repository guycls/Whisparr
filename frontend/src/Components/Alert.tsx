import MuiAlert from '@mui/material/Alert';
import React from 'react';
import { Kind } from 'Helpers/Props/kinds';

interface AlertProps {
  className?: string;
  kind?: Kind;
  children: React.ReactNode;
}

function kindToSeverity(kind?: Kind) {
  switch (kind) {
    case 'danger':
      return 'error' as const;
    case 'success':
      return 'success' as const;
    case 'warning':
      return 'warning' as const;
    default:
      return 'info' as const;
  }
}

function Alert(props: AlertProps) {
  const { className, kind = 'info', children } = props;

  return (
    <MuiAlert className={className} severity={kindToSeverity(kind)} sx={{ mb: 2 }}>
      {children}
    </MuiAlert>
  );
}

export default Alert;
