import Box from '@mui/material/Box';
import React from 'react';

interface InteractiveImportRowCellPlaceholderProps {
  isOptional?: boolean;
}

function InteractiveImportRowCellPlaceholder(
  props: InteractiveImportRowCellPlaceholderProps
) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-block',
        my: '-8px',
        width: '100%',
        height: 25,
        border: `2px dashed ${props.isOptional ? 'var(--gray)' : 'var(--dangerColor)'}`,
      }}
    />
  );
}

export default InteractiveImportRowCellPlaceholder;
