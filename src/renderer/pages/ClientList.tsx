// ============================================================
// ClientList Page — Paginated client listing with CRUD
// ============================================================
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, TextField, InputAdornment,
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import ClientTable from '../components/Clients/ClientTable';
import ClientForm from '../components/Clients/ClientForm';
import ConfirmDialog from '../components/common/ConfirmDialog';
import SnackbarNotification from '../components/common/SnackbarNotification';
import EmptyState from '../components/common/EmptyState';
import type { Client, CreateClientInput, UpdateClientInput, NotificationState } from '../types';

const ClientList: React.FC = () => {
  const { t } = useTranslation();

  // Data state
  const [clients, setClients] = useState<Client[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [notification, setNotification] = useState<NotificationState>({
    open: false, message: '', severity: 'success',
  });

  const loadClients = useCallback(async () => {
    setLoading(true);
    try {
      const response = await window.api.clients.getAll({
        page, limit, search, sortBy: 'created_at', sortOrder: 'DESC',
      });
      if (response.success && response.data) {
        setClients(response.data.data);
        setTotal(response.data.total);
      }
    } catch (err) {
      console.error('Failed to load clients:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  // Debounced search
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleSave = async (input: CreateClientInput | UpdateClientInput) => {
    try {
      const response = 'id' in input
        ? await window.api.clients.update(input)
        : await window.api.clients.create(input);

      if (response.success) {
        setFormOpen(false);
        setEditingClient(null);
        setNotification({ open: true, message: response.message || t('app.success'), severity: 'success' });
        loadClients();
      } else {
        setNotification({ open: true, message: response.error || t('app.error'), severity: 'error' });
      }
    } catch (err) {
      setNotification({ open: true, message: (err as Error).message, severity: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const response = await window.api.clients.delete(deleteTarget.id);
      if (response.success) {
        setDeleteTarget(null);
        setNotification({ open: true, message: response.message || t('app.success'), severity: 'success' });
        loadClients();
      } else {
        setNotification({ open: true, message: response.error || t('app.error'), severity: 'error' });
      }
    } catch (err) {
      setNotification({ open: true, message: (err as Error).message, severity: 'error' });
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>
          {t('clients.title')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => { setEditingClient(null); setFormOpen(true); }}
        >
          {t('clients.addClient')}
        </Button>
      </Box>

      {/* Search */}
      <TextField
        placeholder={t('clients.searchPlaceholder')}
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        size="small"
        sx={{ mb: 2, maxWidth: 400 }}
        fullWidth
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      {/* Table or Empty State */}
      {clients.length === 0 && !loading ? (
        <EmptyState
          title={t('clients.noClients')}
          action={
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>
              {t('clients.addClient')}
            </Button>
          }
        />
      ) : (
        <ClientTable
          clients={clients}
          total={total}
          page={page}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={(l) => { setLimit(l); setPage(1); }}
          onEdit={(c) => { setEditingClient(c); setFormOpen(true); }}
          onDelete={(c) => setDeleteTarget(c)}
        />
      )}

      {/* Dialogs */}
      <ClientForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditingClient(null); }}
        onSave={handleSave}
        client={editingClient}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('clients.deleteClient')}
        message={t('clients.deleteConfirm')}
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

export default ClientList;
