// ============================================================
// GlovoSection Page — Standalone CRUD Management for Glovo Riders
// ============================================================
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, TextField, InputAdornment, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, IconButton, Tooltip, Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DeliveryDining as GlovoIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import GlovoForm from '../components/Glovo/GlovoForm';
import ConfirmDialog from '../components/common/ConfirmDialog';
import SnackbarNotification from '../components/common/SnackbarNotification';
import EmptyState from '../components/common/EmptyState';
import CopyableId from '../components/common/CopyableId';
import { formatDate } from '../utils/formatters';
import type { GlovoRider, CreateGlovoRiderInput, UpdateGlovoRiderInput, NotificationState } from '../types';

const GlovoSection: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';

  // Data state
  const [riders, setRiders] = useState<GlovoRider[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [searchInput, setSearchInput] = useState(q);
  const [search, setSearch] = useState(q);

  // Dialogs state
  const [formOpen, setFormOpen] = useState(false);
  const [editingRider, setEditingRider] = useState<GlovoRider | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GlovoRider | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [notification, setNotification] = useState<NotificationState>({
    open: false, message: '', severity: 'success',
  });

  const loadRiders = useCallback(async () => {
    try {
      const response = await window.api.glovo.getAll({ page, limit, search });
      if (response.success && response.data) {
        setRiders(response.data.data);
        setTotal(response.data.total);
      }
    } catch (err) {
      console.error('Failed to load riders:', err);
    }
  }, [page, limit, search]);

  useEffect(() => { loadRiders(); }, [loadRiders]);

  useEffect(() => {
    const timer = setTimeout(() => { setSearch(searchInput); setPage(1); }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleSave = async (input: CreateGlovoRiderInput | UpdateGlovoRiderInput) => {
    setErrorMsg('');
    try {
      const response = 'id' in input
        ? await window.api.glovo.update(input as UpdateGlovoRiderInput)
        : await window.api.glovo.create(input as CreateGlovoRiderInput);

      if (response.success) {
        setFormOpen(false);
        setEditingRider(null);
        setNotification({ open: true, message: response.message!, severity: 'success' });
        loadRiders();
      } else {
        setErrorMsg(response.error || t('app.error'));
      }
    } catch (err) {
      setErrorMsg((err as Error).message);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const response = await window.api.glovo.delete(deleteTarget.id);
      if (response.success) {
        setDeleteTarget(null);
        setNotification({ open: true, message: response.message!, severity: 'success' });
        loadRiders();
      } else {
        setNotification({ open: true, message: response.error!, severity: 'error' });
      }
    } catch (err) {
      setNotification({ open: true, message: (err as Error).message, severity: 'error' });
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Box
            sx={{
              width: 48, height: 48, borderRadius: 2,
              bgcolor: '#ffc244', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <GlovoIcon sx={{ color: '#1a1a1a', fontSize: 28 }} />
          </Box>
          <Typography variant="h4" fontWeight={700}>{t('glovo.title')}</Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => { setEditingRider(null); setErrorMsg(''); setFormOpen(true); }}
          sx={{
            bgcolor: '#ffc244',
            color: '#1a1a1a',
            fontWeight: 700,
            '&:hover': { bgcolor: '#e0ab3b' }
          }}
        >
          {t('glovo.addAccount')}
        </Button>
      </Box>

      {/* Search */}
      <TextField
        placeholder={t('glovo.searchPlaceholder')}
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        size="small"
        sx={{ mb: 2, maxWidth: 400 }}
        fullWidth
        InputProps={{
          startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
        }}
      />

      {/* Table / Empty state */}
      {riders.length === 0 ? (
        <EmptyState
          title={t('glovo.noAccount')}
          icon={<GlovoIcon sx={{ fontSize: 40, color: '#ffc244' }} />}
          action={
            <Button
              variant="contained"
              onClick={() => { setEditingRider(null); setErrorMsg(''); setFormOpen(true); }}
              sx={{ bgcolor: '#ffc244', color: '#1a1a1a', fontWeight: 600, '&:hover': { bgcolor: '#e0ab3b' } }}
            >
              {t('glovo.addAccount')}
            </Button>
          }
        />
      ) : (
        <Paper sx={{ overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('glovo.riderId')}</TableCell>
                  <TableCell>{t('glovo.riderName')}</TableCell>
                  <TableCell>{t('glovo.phone')}</TableCell>
                  <TableCell>Ville</TableCell>
                  <TableCell>{t('clients.createdAt')}</TableCell>
                  <TableCell align="center">{t('app.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {riders.map((rider) => (
                  <TableRow
                    key={rider.id}
                    hover
                    onClick={() => navigate(`/glovo/${rider.id}`)}
                    sx={{
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <TableCell>
                      <CopyableId value={rider.rider_id} size="small" color="warning" variant="outlined" sx={{ fontWeight: 600 }} />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar sx={{ width: 30, height: 30, bgcolor: '#ffc244', fontSize: '0.7rem', color: '#1a1a1a', fontWeight: 700 }}>
                          {rider.rider_name.substring(0, 2).toUpperCase()}
                        </Avatar>
                        {rider.rider_name}
                      </Box>
                    </TableCell>
                    <TableCell>{rider.phone || '—'}</TableCell>
                    <TableCell>{rider.city || '—'}</TableCell>
                    <TableCell>{formatDate(rider.created_at)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title={t('app.edit')}>
                        <IconButton
                          size="small"
                          color="info"
                          onClick={(e) => { e.stopPropagation(); setEditingRider(rider); setErrorMsg(''); setFormOpen(true); }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('app.delete')}>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => { e.stopPropagation(); setDeleteTarget(rider); }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
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
            rowsPerPageOptions={[10, 25, 50]}
            labelRowsPerPage=""
          />
        </Paper>
      )}

      {/* Glovo Form Dialog */}
      {formOpen && (
        <GlovoForm
          open={formOpen}
          onClose={() => { setFormOpen(false); setEditingRider(null); }}
          onSave={handleSave}
          account={editingRider as any}
          error={errorMsg}
        />
      )}

      {/* Confirm Delete */}
      <ConfirmDialog
        open={!!deleteTarget}
        title={t('glovo.deleteAccount')}
        message={t('glovo.deleteConfirm')}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        severity="error"
      />

      <SnackbarNotification
        notification={notification}
        onClose={() => setNotification({ ...notification, open: false })}
      />
    </Box>
  );
};

export default GlovoSection;

