// ============================================================
// TopBar — Search + theme/language toggles
// ============================================================
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  AppBar, Toolbar, InputBase, IconButton, Box, Tooltip, Typography, Chip,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Translate as TranslateIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useThemeMode } from '../../theme/ThemeContext';
import SearchSuggestions from '../Search/SearchSuggestions';
import type { SearchResult } from '../../types';

const SUGGESTION_LIMIT = 8;
const DEBOUNCE_MS = 200;

/** Lower score = closer match, so the most relevant rows surface first. */
const matchScore = (result: SearchResult, query: string): number => {
  const value = result.match_value.toLowerCase();
  const name = (result.client_name || '').toLowerCase();
  if (value === query) return 0;
  if (value.startsWith(query)) return 1;
  if (name.startsWith(query)) return 2;
  if (value.includes(query)) return 3;
  return 4;
};

const TopBar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { mode, toggleTheme } = useThemeMode();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');

  const searchBoxRef = useRef<HTMLDivElement | null>(null);
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // Debounced lookup — runs while typing, no submit required.
  useEffect(() => {
    const trimmed = searchValue.trim();
    if (!trimmed) {
      setSuggestions([]);
      setSuggestionsLoading(false);
      return;
    }

    setSuggestionsLoading(true);
    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        const response = await window.api.search.global(trimmed);
        if (cancelled) return;
        const data = response.success && response.data ? response.data : [];
        const query = trimmed.toLowerCase();
        setSuggestions(
          [...data]
            .sort((a, b) => matchScore(a, query) - matchScore(b, query))
            .slice(0, SUGGESTION_LIMIT),
        );
      } catch (err) {
        if (!cancelled) {
          console.error('Search error:', err);
          setSuggestions([]);
        }
      } finally {
        if (!cancelled) setSuggestionsLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => { cancelled = true; clearTimeout(timer); };
  }, [searchValue]);

  useEffect(() => { setHighlightedIndex(-1); }, [suggestions]);

  const goToSearchPage = useCallback((value: string) => {
    setSuggestionsOpen(false);
    navigate(`/search?q=${encodeURIComponent(value)}`);
  }, [navigate]);

  const handleSuggestionSelect = useCallback((result: SearchResult) => {
    setSuggestionsOpen(false);
    setSearchValue(result.match_value);
    if (result.type === 'glovo') {
      navigate(`/glovo?q=${encodeURIComponent(result.match_value)}`);
    } else {
      navigate(`/clients/${result.client_id}`);
    }
  }, [navigate]);

  const handleSearchKeyDown = useCallback((e: React.KeyboardEvent) => {
    const hasSuggestions = suggestionsOpen && suggestions.length > 0;

    if (e.key === 'ArrowDown' && hasSuggestions) {
      e.preventDefault();
      setHighlightedIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp' && hasSuggestions) {
      e.preventDefault();
      setHighlightedIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === 'Escape') {
      setSuggestionsOpen(false);
    } else if (e.key === 'Enter') {
      const highlighted = hasSuggestions ? suggestions[highlightedIndex] : undefined;
      if (highlighted) {
        e.preventDefault();
        handleSuggestionSelect(highlighted);
      } else if (searchValue.trim()) {
        goToSearchPage(searchValue.trim());
      }
    }
  }, [suggestionsOpen, suggestions, highlightedIndex, searchValue, handleSuggestionSelect, goToSearchPage]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    setSuggestionsOpen(Boolean(e.target.value.trim()));
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'fr' ? 'ar' : 'fr';
    i18n.changeLanguage(newLang);
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: 'transparent',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Toolbar sx={{ gap: 2, minHeight: '64px !important' }}>
        {/* Search */}
        <Box
          ref={searchBoxRef}
          sx={{
            display: 'flex',
            alignItems: 'center',
            flex: 1,
            maxWidth: 500,
            bgcolor: 'background.paper',
            borderRadius: 3,
            px: 2,
            py: 0.5,
            border: '1px solid',
            borderColor: 'divider',
            transition: 'border-color 0.2s',
            '&:focus-within': {
              borderColor: 'primary.main',
              boxShadow: '0 0 0 3px rgba(99,102,241,0.1)',
            },
          }}
        >
          <SearchIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
          <InputBase
            placeholder={t('app.search')}
            value={searchValue}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
            onFocus={() => setSuggestionsOpen(Boolean(searchValue.trim()))}
            sx={{ flex: 1, fontSize: '0.875rem' }}
            inputProps={{ 'aria-label': 'search' }}
          />
          {suggestionsLoading && <CircularProgress size={16} sx={{ ml: 1 }} />}
        </Box>

        <SearchSuggestions
          open={suggestionsOpen}
          anchorEl={searchBoxRef.current}
          results={suggestions}
          loading={suggestionsLoading}
          highlightedIndex={highlightedIndex}
          onSelect={handleSuggestionSelect}
          onViewAll={() => goToSearchPage(searchValue.trim())}
          onClose={() => setSuggestionsOpen(false)}
        />

        <Box sx={{ flex: 1 }} />

        {/* Language Toggle */}
        <Tooltip title={i18n.language === 'fr' ? 'العربية' : 'Français'}>
          <Chip
            icon={<TranslateIcon sx={{ fontSize: 18 }} />}
            label={i18n.language === 'fr' ? 'FR' : 'AR'}
            onClick={toggleLanguage}
            variant="outlined"
            size="small"
            sx={{
              cursor: 'pointer',
              fontWeight: 600,
              borderRadius: 2,
              '&:hover': { bgcolor: 'action.hover' },
            }}
          />
        </Tooltip>

        {/* Theme Toggle */}
        <Tooltip title={mode === 'dark' ? t('settings.lightMode') : t('settings.darkMode')}>
          <IconButton
            onClick={toggleTheme}
            sx={{
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': {
                bgcolor: 'action.hover',
                transform: 'rotate(30deg)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {mode === 'dark' ? (
              <LightModeIcon sx={{ fontSize: 20, color: '#fbbf24' }} />
            ) : (
              <DarkModeIcon sx={{ fontSize: 20, color: '#6366f1' }} />
            )}
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
