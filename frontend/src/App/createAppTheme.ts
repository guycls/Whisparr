import { alpha, createTheme, PaletteMode, Theme } from '@mui/material/styles';

export function frostedBackground(theme: Theme) {
  const veil = theme.palette.mode === 'dark' ? 0.4 : 0.28;

  return {
    backgroundColor: alpha(theme.palette.background.paper, veil),
    backgroundImage: 'none',
    backdropFilter: 'blur(18px) saturate(1.45)',
    WebkitBackdropFilter: 'blur(18px) saturate(1.45)',
  };
}

function dropdownPaper(theme: Theme) {
  return {
    ...frostedBackground(theme),
    border: `1px solid ${alpha(
      theme.palette.common.white,
      theme.palette.mode === 'dark' ? 0.14 : 0.38
    )}`,
  };
}

export default function createAppTheme(
  mode: PaletteMode,
  colorImpaired: boolean
) {
  return createTheme({
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            background: {
              default: '#f3f4f6',
              paper: '#fff',
            },
          }
        : {}),
      ...(colorImpaired
        ? {
            primary: { main: '#1565c0' },
            secondary: { main: '#6a1b9a' },
            error: { main: '#c62828' },
            warning: { main: '#ef6c00' },
            success: { main: '#2e7d32' },
            info: { main: '#0277bd' },
          }
        : {
            primary: { main: '#ff69b4' },
          }),
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 480,
        md: 768,
        lg: 992,
        xl: 1200,
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: 14,
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          html: {
            height: '100%',
          },
          body: {
            height: '100%',
            overflow: 'hidden',
            '@media (max-width: 767.95px)': {
              overflowY: 'auto',
            },
          },
          '#root': {
            height: '100%',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          head: ({ theme }) => ({
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.01em',
            color: theme.palette.text.secondary,
            whiteSpace: 'nowrap',
            backgroundColor: theme.palette.background.default,
          }),
          sizeSmall: {
            paddingTop: 10,
            paddingBottom: 10,
            paddingLeft: 12,
            paddingRight: 12,
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: ({ theme }) => ({
            '&:last-of-type td': {
              borderBottom: 0,
            },
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
          }),
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: ({ theme }) => dropdownPaper(theme),
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: ({ theme }) => ({
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.12),
            },
            '&.Mui-selected': {
              backgroundColor: alpha(theme.palette.primary.main, 0.18),
              color: theme.palette.primary.main,
            },
            '&.Mui-selected:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.26),
            },
          }),
        },
      },
      MuiAutocomplete: {
        styleOverrides: {
          paper: ({ theme }) => dropdownPaper(theme),
        },
      },
      MuiFormHelperText: {
        styleOverrides: {
          root: {
            marginLeft: 0,
            marginTop: 4,
            lineHeight: 1.4,
          },
        },
      },
    },
  });
}

function hexToRgba(color: string, alpha: number) {
  const value = color.replace('#', '');
  const normalized =
    value.length === 3
      ? value
          .split('')
          .map((channel) => channel + channel)
          .join('')
      : value;
  const red = parseInt(normalized.slice(0, 2), 16);
  const green = parseInt(normalized.slice(2, 4), 16);
  const blue = parseInt(normalized.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export function applyMuiCssVariables(theme: Theme) {
  const { palette } = theme;
  const paper = palette.background.paper;
  const background = palette.background.default;
  const text = palette.text.primary;
  const secondary = palette.text.secondary;
  const disabled = palette.text.disabled;
  const divider = palette.divider;
  const primary = palette.primary.main;
  const error = palette.error.main;
  const warning = palette.warning.main;
  const success = palette.success.main;
  const info = palette.info.main;
  const hover = palette.action.hover;
  const selected = palette.action.selected;
  const grey = palette.grey;

  const variables: Record<string, string> = {
    textColor: text,
    defaultColor: text,
    disabledColor: disabled,
    dimColor: secondary,
    helpTextColor: secondary,
    black: '#000',
    white: palette.common.white,
    primaryColor: primary,
    successColor: success,
    dangerColor: error,
    warningColor: warning,
    infoColor: info,
    purple: palette.secondary.main,
    darkGray: secondary,
    gray: disabled,
    mediumGray: secondary,
    pageBackground: background,
    borderColor: divider,
    inputBorderColor: divider,
    inputBoxShadowColor: 'rgba(0, 0, 0, 0.075)',
    inputFocusBorderColor: primary,
    inputFocusBoxShadowColor: hexToRgba(primary, 0.4),
    inputErrorBorderColor: error,
    inputWarningBorderColor: warning,
    colorImpairedGradient: divider,
    colorImpairedGradientDark: paper,
    disabledInputColor: disabled,
    inputBackgroundColor: paper,
    inputBackground: paper,
    inputHoverBackgroundColor: hover,
    inputSelectedBackgroundColor: selected,
    inputIconContainerBackgroundColor: paper,
    linkColor: primary,
    linkHoverColor: palette.primary.dark,
    modalBackgroundColor: paper,
    modalCloseButtonHoverColor: secondary,
    menuItemHoverBackgroundColor: hover,
    scrollbarBackgroundColor: divider,
    scrollbarHoverBackgroundColor: secondary,
    tableRowHoverBackgroundColor: hover,
    addSeriesBackgroundColor: paper,
    searchIconContainerBackgroundColor: paper,
    logEventsBackgroundColor: paper,
    calendarBackgroundColor: paper,
    calendarBorderColor: divider,
    calendarTextDim: text,
    calendarTextDimAlternate: text,
    calendarTodayBackgroundColor: selected,
    popoverBodyBackgroundColor: paper,
    popoverTitleBackgroundColor: grey[palette.mode === 'dark' ? 800 : 200],
    popoverTitleBorderColor: divider,
    popoverArrowBorderColor: paper,
    popoverArrowBorderInverseColor: grey[700],
    popoverShadowColor: 'rgba(0, 0, 0, 0.2)',
    popoverShadowInverseColor: 'rgba(0, 0, 0, 0.35)',
    themeDarkColor: grey[700],
    sidebarColor: text,
    iconButtonHoverColor: secondary,
    defaultFontFamily:
      theme.typography.fontFamily ?? 'Roboto, Helvetica, Arial, sans-serif',
    torrentColor: success,
    usenetColor: info,
  };

  Object.entries(variables).forEach(([name, value]) => {
    document.documentElement.style.setProperty(`--${name}`, value);
  });
}
