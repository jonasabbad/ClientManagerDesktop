// ============================================================
// MUI Theme — Dark and Light mode with premium styling
// ============================================================
import { createTheme, type ThemeOptions } from '@mui/material/styles';

const sharedTypography = {
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  h1: { fontWeight: 700, fontSize: '2.25rem', letterSpacing: '-0.02em' },
  h2: { fontWeight: 700, fontSize: '1.875rem', letterSpacing: '-0.01em' },
  h3: { fontWeight: 600, fontSize: '1.5rem' },
  h4: { fontWeight: 600, fontSize: '1.25rem' },
  h5: { fontWeight: 600, fontSize: '1.1rem' },
  h6: { fontWeight: 600, fontSize: '1rem' },
  subtitle1: { fontWeight: 500, fontSize: '0.95rem' },
  subtitle2: { fontWeight: 500, fontSize: '0.85rem' },
  body1: { fontSize: '0.9rem', lineHeight: 1.6 },
  body2: { fontSize: '0.825rem', lineHeight: 1.5 },
  button: { fontWeight: 600, textTransform: 'none' as const, letterSpacing: '0.01em' },
};

const sharedComponents: ThemeOptions['components'] = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 10,
        padding: '8px 20px',
        boxShadow: 'none',
        '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
      },
      containedPrimary: {
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        '&:hover': {
          background: 'linear-gradient(135deg, #5558e6 0%, #7c4fe0 100%)',
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 16,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
        '&:hover': {
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 12,
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 10,
        },
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 16,
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        fontWeight: 500,
      },
    },
  },
  MuiTableHead: {
    styleOverrides: {
      root: {
        '& .MuiTableCell-head': {
          fontWeight: 600,
          fontSize: '0.8rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        },
      },
    },
  },
};

// ==================== DARK THEME ====================
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#6366f1', light: '#818cf8', dark: '#4f46e5' },
    secondary: { main: '#f472b6', light: '#f9a8d4', dark: '#ec4899' },
    background: {
      default: '#0f172a',
      paper: '#1e293b',
    },
    text: {
      primary: '#f1f5f9',
      secondary: '#94a3b8',
    },
    divider: 'rgba(148, 163, 184, 0.12)',
    success: { main: '#22c55e' },
    warning: { main: '#f59e0b' },
    error: { main: '#ef4444' },
    info: { main: '#3b82f6' },
  },
  typography: sharedTypography,
  components: {
    ...sharedComponents,
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
          backgroundAttachment: 'fixed',
          scrollbarColor: '#334155 #1e293b',
          '&::-webkit-scrollbar': { width: 8 },
          '&::-webkit-scrollbar-track': { background: '#1e293b' },
          '&::-webkit-scrollbar-thumb': {
            background: '#334155', borderRadius: 4,
            '&:hover': { background: '#475569' },
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
          borderRight: '1px solid rgba(148, 163, 184, 0.08)',
        },
      },
    },
  },
  shape: { borderRadius: 12 },
});

// ==================== LIGHT THEME ====================
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#6366f1', light: '#818cf8', dark: '#4f46e5' },
    secondary: { main: '#ec4899', light: '#f472b6', dark: '#db2777' },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
    divider: 'rgba(0, 0, 0, 0.08)',
    success: { main: '#16a34a' },
    warning: { main: '#d97706' },
    error: { main: '#dc2626' },
    info: { main: '#2563eb' },
  },
  typography: sharedTypography,
  components: {
    ...sharedComponents,
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)',
          backgroundAttachment: 'fixed',
          scrollbarColor: '#cbd5e1 #f1f5f9',
          '&::-webkit-scrollbar': { width: 8 },
          '&::-webkit-scrollbar-track': { background: '#f1f5f9' },
          '&::-webkit-scrollbar-thumb': {
            background: '#cbd5e1', borderRadius: 4,
            '&:hover': { background: '#94a3b8' },
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          borderRight: '1px solid rgba(0, 0, 0, 0.06)',
        },
      },
    },
  },
  shape: { borderRadius: 12 },
});
