// ============================================================
// Theme Context — Dark/Light mode toggle with persistence
// ============================================================
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { darkTheme, lightTheme } from './theme';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import { useTranslation } from 'react-i18next';

type ThemeMode = 'dark' | 'light';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'dark',
  toggleTheme: () => {},
});

export const useThemeMode = () => useContext(ThemeContext);

// LTR cache (default)
const ltrCache = createCache({
  key: 'mui-ltr',
  prepend: true,
});

// RTL cache for Arabic
const rtlCache = createCache({
  key: 'mui-rtl',
  stylisPlugins: [prefixer, rtlPlugin],
  prepend: true,
});

export const ThemeContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('theme-mode');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  const isRtl = i18n.language === 'ar';

  const toggleTheme = () => {
    setMode(prev => {
      const newMode = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('theme-mode', newMode);
      return newMode;
    });
  };

  // Update document direction on language change
  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language, isRtl]);

  const theme = useMemo(() => {
    const baseTheme = mode === 'dark' ? darkTheme : lightTheme;
    return {
      ...baseTheme,
      direction: isRtl ? 'rtl' as const : 'ltr' as const,
    };
  }, [mode, isRtl]);

  const cache = isRtl ? rtlCache : ltrCache;

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <CacheProvider value={cache}>
        <MuiThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </MuiThemeProvider>
      </CacheProvider>
    </ThemeContext.Provider>
  );
};
