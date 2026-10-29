// ============================================================
// SearchSuggestions — Live dropdown for the top bar search field
// ============================================================
import React from 'react';
import {
  Popper, Paper, Fade, List, ListItemButton, ListItemIcon, ListItemText,
  Typography, Chip, Box, Divider, CircularProgress, ClickAwayListener,
} from '@mui/material';
import {
  Person as PersonIcon,
  Code as CodeIcon,
  DeliveryDining as GlovoIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { SearchResult } from '../../types';

interface SearchSuggestionsProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  results: SearchResult[];
  loading: boolean;
  /** Index of the keyboard-highlighted row, -1 when none. */
  highlightedIndex: number;
  onSelect: (result: SearchResult) => void;
  onViewAll: () => void;
  onClose: () => void;
}

const getIcon = (type: string) => {
  switch (type) {
    case 'client': return <PersonIcon color="primary" fontSize="small" />;
    case 'service_code': return <CodeIcon color="success" fontSize="small" />;
    case 'glovo': return <GlovoIcon sx={{ color: '#ffc244' }} fontSize="small" />;
    default: return <SearchIcon fontSize="small" />;
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

const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  open, anchorEl, results, loading, highlightedIndex, onSelect, onViewAll, onClose,
}) => {
  const { t } = useTranslation();

  if (!open || !anchorEl) return null;

  const handleClickAway = (event: MouseEvent | TouchEvent) => {
    // Clicking back inside the search field must not close the dropdown.
    if (anchorEl.contains(event.target as Node)) return;
    onClose();
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Popper
        open
        anchorEl={anchorEl}
        placement="bottom-start"
        transition
        style={{ width: anchorEl.offsetWidth }}
        sx={{ zIndex: (theme) => theme.zIndex.modal }}
        modifiers={[{ name: 'offset', options: { offset: [0, 6] } }]}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={120}>
            <Paper
              elevation={8}
              sx={{
                overflow: 'hidden',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              {loading && results.length === 0 ? (
                <Box display="flex" alignItems="center" justifyContent="center" py={3}>
                  <CircularProgress size={20} />
                </Box>
              ) : results.length === 0 ? (
                <Box textAlign="center" py={3}>
                  <Typography variant="body2" color="text.secondary">
                    {t('search.noResults')}
                  </Typography>
                </Box>
              ) : (
                <>
                  <List disablePadding sx={{ maxHeight: 360, overflowY: 'auto' }}>
                    {results.map((result, index) => (
                      <ListItemButton
                        key={`${result.type}-${result.id}-${result.match_field}`}
                        selected={index === highlightedIndex}
                        onClick={() => onSelect(result)}
                        sx={{
                          py: 1,
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          '&:last-of-type': { borderBottom: 'none' },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 34 }}>
                          {getIcon(result.type)}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box display="flex" alignItems="center" gap={1}>
                              <Typography variant="body2" fontWeight={500} noWrap>
                                {result.client_name}
                              </Typography>
                              <Chip
                                label={t(`search.resultType.${result.type}`)}
                                size="small"
                                color={getTypeColor(result.type) as any}
                                variant="outlined"
                                sx={{ fontSize: '0.65rem', height: 20 }}
                              />
                            </Box>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary" noWrap component="span">
                              {t(`search.matchField.${result.match_field}`)}: {result.match_value}
                            </Typography>
                          }
                        />
                      </ListItemButton>
                    ))}
                  </List>
                  <Divider />
                  <ListItemButton onClick={onViewAll} sx={{ py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 34 }}>
                      <SearchIcon fontSize="small" color="action" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          {t('search.viewAll')}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                </>
              )}
            </Paper>
          </Fade>
        )}
      </Popper>
    </ClickAwayListener>
  );
};

export default SearchSuggestions;
