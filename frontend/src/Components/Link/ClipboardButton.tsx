import Box from '@mui/material/Box';
import React, { useCallback, useEffect, useState } from 'react';
import FormInputButton from 'Components/Form/FormInputButton';
import Icon from 'Components/Icon';
import { icons, kinds } from 'Helpers/Props';
import { ButtonProps } from './Button';

export interface ClipboardButtonProps extends Omit<ButtonProps, 'children'> {
  value: string;
}

export type ClipboardState = 'success' | 'error' | null;

export default function ClipboardButton({
  value,
  className,
  ...otherProps
}: ClipboardButtonProps) {
  const [state, setState] = useState<ClipboardState>(null);

  useEffect(() => {
    if (!state) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setState(null);
    }, 3000);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [state]);

  const handleClick = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setState('success');
    } catch (_) {
      setState('error');
    }
  }, [value]);

  return (
    <FormInputButton
      className={className}
      onClick={handleClick}
      {...otherProps}
    >
      <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
        {state ? (
          <Icon
            name={state === 'error' ? icons.DANGER : icons.CHECK}
            kind={state === 'error' ? kinds.DANGER : kinds.SUCCESS}
          />
        ) : (
          <Icon name={icons.CLIPBOARD} />
        )}
      </Box>
    </FormInputButton>
  );
}
