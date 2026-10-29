// ============================================================
// ActivityLog Page — Filterable audit trail
// ============================================================
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination,
  TextField, InputAdornment, Chip,
} from '@mui/material';
import { Search as SearchIcon, History as HistoryIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import EmptyState from '../components/common/EmptyState';
import { formatDateTime } from '../utils/formatters';
import type { ActivityLog as ActivityLogType } from '../types';

const actionColors: Record<string, 'primary' | 'success' | 'error' | 'warning' | 'info' | 'default'> = {
  CREATE_CLIENT: 'success',
  UPDATE_CLIENT: 'info',
  DELETE_CLIENT: 'error',
  CREATE_CODE: 'success',
  UPDATE_CODE: 'info',
  DELETE_CODE: 'error',
  CREATE_GLOVO: 'success',
  UPDATE_GLOVO: 'info',
  DELETE_GLOVO: 'error',
  BACKUP: 'warning',
  RESTORE: 'warning',
  EXPORT: 'primary',
  CREATE_SERVICE: 'success',
  UPDATE_SERVICE: 'info',
};

const ActivityLog: React.FC = () => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<ActivityLogType[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const loadLogs = useCallback(async () => {
    const response = await window.api.activity.getAll({ page, limit, search });
    if (response.success && response.data) {
      setLogs(response.data.data);
      setTotal(response.data.total);
    }
  }, [page, limit, search]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  useEffect(() => {
    const timer = setTimeout(() => { setSearch(searchInput); setPage(1); }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        {t('activity.title')}
      </Typography>

      <TextField
        placeholder={t('app.search')}
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        size="small"
        sx={{ mb: 2, maxWidth: 400 }}
        fullWidth
        InputProps={{
          startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
        }}
      />

      {logs.length === 0 ? (
        <EmptyState
          title={t('activity.noActivity')}
          icon={<HistoryIcon sx={{ fontSize: 40, color: 'text.secondary' }} />}
        />
      ) : (
        <Paper sx={{ overflow: 'hidden' }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('activity.action')}</TableCell>
                  <TableCell>{t('activity.details')}</TableCell>
                  <TableCell>{t('activity.entity')}</TableCell>
                  <TableCell>{t('activity.date')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell>
                      <Chip
                        label={t(`activity.actions.${log.action}`) || log.action}
                        size="small"
                        color={actionColors[log.action] || 'default'}
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.details || '—'}
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {log.entity_type} {log.entity_id ? `#${log.entity_id}` : ''}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatDateTime(log.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={total}
            page={page - 1}
            rowsPerPage={limit}
            onPageChange={(_, p) => setPage(p + 1)}
            onRowsPerPageChange={(e) => { setLimit(parseInt(e.target.value)); setPage(1); }}
            rowsPerPageOptions={[10, 25, 50, 100]}
            labelRowsPerPage=""
          />
        </Paper>
      )}
    </Box>
  );
};

export default ActivityLog;
