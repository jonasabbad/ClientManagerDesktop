// ============================================================
// GlobalSearch — Updated for decoupled Glovo navigation
// ============================================================
import React, { useState, useEffect, useCallback } from 'react';
import {
  TextField, Box, List, ListItem, ListItemIcon, ListItemText,
  Typography, Chip, Paper, InputAdornment, CircularProgress,
} from '@mui/material';
import {
  Person as PersonIcon,
  Code as CodeIcon,
  DeliveryDining as GlovoIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { SearchResult } from '../../types';

interface GlobalSearchProps {
  initialQuery?: string;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ initialQuery = '' }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await window.api.search.global(searchQuery);
      if (response.success && response.data) {
        setResults(response.data);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => performSearch(query), 200);
    return () => clearTimeout(timer);
  }, [query, performSearch]);

  useEffect(() => {
    if (initialQuery) setQuery(initialQuery);
  }, [initialQuery]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'client': return <PersonIcon color="primary" />;
      case 'service_code': return <CodeIcon color="success" />;
      case 'glovo': return <GlovoIcon sx={{ color: '#ffc244' }} />;
      default: return <SearchIcon />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'client': return 'primary';
      case 'service_code': return 'success';
      case 'glovo': return 'warning';
      default: return 'default';
    }
  };

  const handleItemClick = (result: SearchResult) => {
    if (result.type === 'glovo') {
      navigate(`/glovo?q=${encodeURIComponent(result.match_value)}`);
    } else {
      navigate(`/clients/${result.client_id}`);
    }
  };

  return (
    <Box>
      <TextField
        fullWidth
        placeholder={t('search.placeholder')}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: loading ? (
            <InputAdornment position="end">
              <CircularProgress size={20} />
            </InputAdornment>
          ) : null,
        }}
        sx={{
          mb: 2,
          '& .MuiOutlinedInput-root': {
            fontSize: '1.1rem',
            py: 0.5,
          },
        }}
      />

      {results.length > 0 && (
        <Paper sx={{ overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
          <List disablePadding>
            {results.map((result, index) => (
              <ListItem
                key={`${result.type}-${result.id}-${index}`}
                onClick={() => handleItemClick(result)}
                sx={{
                  cursor: 'pointer',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  py: 1.5,
                  transition: 'background 0.15s',
                  '&:hover': { bgcolor: 'action.hover' },
                  '&:last-child': { borderBottom: 'none' },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {getIcon(result.type)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography fontWeight={500}>{result.client_name}</Typography>
                      <Chip
                        label={t(`search.resultType.${result.type}`)}
                        size="small"
                        color={getTypeColor(result.type) as any}
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 22 }}
                      />
                    </Box>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {t(`search.matchField.${result.match_field}`)}: {result.match_value}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {query && !loading && results.length === 0 && (
        <Box textAlign="center" py={6}>
          <Typography color="text.secondary">{t('search.noResults')}</Typography>
        </Box>
      )}

      {!query && (
        <Box textAlign="center" py={6}>
          <SearchIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
          <Typography color="text.secondary">{t('search.typeToSearch')}</Typography>
        </Box>
      )}
    </Box>
  );
};

export default GlobalSearch;
