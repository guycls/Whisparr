import Box from '@mui/material/Box';
import React from 'react';
import Link from 'Components/Link/Link';

interface OverrideMatchDataProps {
  value?: string | number | JSX.Element | JSX.Element[];
  isDisabled?: boolean;
  isOptional?: boolean;
  onPress: () => void;
}

function OverrideMatchData(props: OverrideMatchDataProps) {
  const { value, isDisabled = false, isOptional, onPress } = props;

  return (
    <Link sx={{ width: '100%' }} isDisabled={isDisabled} onPress={onPress}>
      {(value == null || (Array.isArray(value) && value.length === 0)) &&
      !isDisabled ? (
        <Box
          component="span"
          sx={{
            display: 'inline-block',
            my: '-2px',
            width: '100%',
            outline: `2px dashed ${isOptional ? 'var(--gray)' : 'var(--dangerColor)'}`,
            outlineOffset: '-2px',
          }}
        >
          &nbsp;
        </Box>
      ) : (
        value
      )}
    </Link>
  );
}

export default OverrideMatchData;
