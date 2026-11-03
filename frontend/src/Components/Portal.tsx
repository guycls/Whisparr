import MuiPortal from '@mui/material/Portal';
import React from 'react';

interface PortalProps {
  children: React.ReactNode;
  target?: Element | null;
}

function Portal({ children, target }: PortalProps) {
  const container = target === undefined ? document.getElementById('portal-root') : target;

  if (!container) {
    return null;
  }

  return (
    <MuiPortal container={container}>
      {children}
    </MuiPortal>
  );
}

export default Portal;
