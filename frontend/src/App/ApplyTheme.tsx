import CssBaseline from '@mui/material/CssBaseline';
import { PaletteMode, ThemeProvider } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import React, { ReactNode, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import createAppTheme, { applyMuiCssVariables } from './createAppTheme';
import AppState from './State/AppState';

type ThemeName = 'auto' | 'light' | 'dark';

function createThemeSelector() {
  return createSelector(
    (state: AppState) =>
      (state.settings.ui.item.theme ||
        window.Whisparr.theme ||
        'auto') as ThemeName,
    (theme) => theme
  );
}

interface ApplyThemeProps {
  children: ReactNode;
}

function ApplyTheme({ children }: ApplyThemeProps) {
  const themeName = useSelector(createThemeSelector());
  const colorImpaired = useSelector(
    (state: AppState) => !!state.settings.ui.item.enableColorImpairedMode
  );
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');

  let mode: PaletteMode = 'light';

  if (themeName === 'light' || themeName === 'dark') {
    mode = themeName;
  } else if (prefersDark) {
    mode = 'dark';
  }

  const theme = useMemo(
    () => createAppTheme(mode, colorImpaired),
    [mode, colorImpaired]
  );

  useEffect(() => {
    applyMuiCssVariables(theme);
  }, [theme]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

export default ApplyTheme;
