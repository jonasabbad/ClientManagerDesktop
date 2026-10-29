// ============================================================
// ClientProfile Page — Balanced Grid and Actions alignment UI Fix
// ============================================================
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Button, Chip,
  Divider, IconButton, CircularProgress, Breadcrumbs, Link, CardHeader,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  CalendarToday as CalendarIcon,
  Notes as NotesIcon,
  Refresh as RefreshIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ServiceCodeList from '../components/ServiceCodes/ServiceCodeList';
import ServiceCodeForm from '../components/ServiceCodes/ServiceCodeForm';
import ClientForm from '../components/Clients/ClientForm';
import ConfirmDialog from '../components/common/ConfirmDialog';
import SnackbarNotification from '../components/common/SnackbarNotification';
import EmptyState from '../components/common/EmptyState';
import { usePrintServiceCodes } from '../components/ServiceCodes/PrintServiceCodes';
import { formatDateTime } from '../utils/formatters';
import type {
  Client, ServiceCode,
  CreateServiceCodeInput, UpdateServiceCodeInput,
  CreateClientInput, UpdateClientInput, NotificationState,
} from '../types';

const ClientProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Data state
  const [client, setClient] = useState<Client | null>(null);
  const [codes, setCodes] = useState<ServiceCode[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [clientFormOpen, setClientFormOpen] = useState(false);
  const [codeFormOpen, setCodeFormOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<ServiceCode | null>(null);
  const [deleteCode, setDeleteCode] = useState<ServiceCode | null>(null);
  const [codeError, setCodeError] = useState('');
  const [notification, setNotification] = useState<NotificationState>({
    open: false, message: '', severity: 'success',
  });

  const [refreshKey, setRefreshKey] = useState(0);
  const clientId = Number(id);
  const { handlePrint } = usePrintServiceCodes();

  const loadData = useCallback(async () => {
    if (!clientId) return;
    setLoading(true);
    try {
      const [clientRes, codesRes] = await Promise.all([
        window.api.clients.getById(clientId),
        window.api.codes.getByClient(clientId),
      ]);

      if (clientRes.success && clientRes.data) setClient(clientRes.data);
      if (codesRes.success && codesRes.data) setCodes(codesRes.data);
    } catch (err) {
      console.error('Failed to load client data:', err);
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  const handleRefresh = async () => {
    if (!clientId) return;
    try {
      const res = await window.api.codes.getByClient(clientId);
      if (res.success && res.data) {
        setCodes(res.data);
        setRefreshKey(prev => prev + 1);
        setNotification({
          open: true,
          message: "Données actualisées !",
          severity: "success"
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { loadData(); }, [loadData]);

  // Client Edit Save
  const handleClientSave = async (input: CreateClientInput | UpdateClientInput) => {
    const response = await window.api.clients.update(input as UpdateClientInput);
    if (response.success) {
      setClientFormOpen(false);
      setNotification({ open: true, message: response.message!, severity: 'success' });
      loadData();
    } else {
      setNotification({ open: true, message: response.error!, severity: 'error' });
    }
  };

  // Service Code CRUD
  const handleCodeSave = async (input: CreateServiceCodeInput | UpdateServiceCodeInput) => {
    setCodeError('');
    const response = 'client_id' in input
      ? await window.api.codes.create(input)
      : await window.api.codes.update(input as UpdateServiceCodeInput);

    if (response.success) {
      setCodeFormOpen(false);
      setEditingCode(null);
      setNotification({ open: true, message: response.message!, severity: 'success' });
      loadData();
    } else {
      setCodeError(response.error || '');
    }
  };

  const handleCodeDelete = async () => {
    if (!deleteCode) return;
    const response = await window.api.codes.delete(deleteCode.id);
    if (response.success) {
      setDeleteCode(null);
      setNotification({ open: true, message: response.message!, severity: 'success' });
      loadData();
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (!client) {
    return <EmptyState title="Client not found" />;
  }

  return (
    <Box>
      {/* Breadcrumbs */}
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <IconButton onClick={() => navigate('/clients')} size="small">
          <BackIcon />
        </IconButton>
        <Breadcrumbs>
          <Link
            component="button"
            underline="hover"
            color="text.secondary"
            onClick={() => navigate('/clients')}
            sx={{ cursor: 'pointer' }}
          >
            {t('nav.clients')}
          </Link>
          <Typography color="text.primary" fontWeight={600}>
            {client.full_name}
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Grid Layout containing Profile and Codes */}
      <Grid container spacing={3}>
        {/* Left Side: Client Info */}
        <Grid item xs={12} md={4}>
          <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardHeader
              title={t('clients.personalInfo')}
              titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }}
              action={
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => setClientFormOpen(true)}
                  sx={{ borderRadius: 2 }}
                >
                  {t('app.edit')}
                </Button>
              }
            />
            <Divider />
            <CardContent sx={{ pt: 2 }}>
              <Box display="flex" flexDirection="column" gap={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">{t('clients.id')}</Typography>
                  <Box mt={0.5}>
                    <Chip label={`#${client.id}`} size="small" variant="outlined" />
                  </Box>
                </Box>
                <InfoRow icon={<PersonIcon />} label={t('clients.fullName')} value={client.full_name} />
                <InfoRow icon={<PhoneIcon />} label={t('clients.phone')} value={client.phone || '—'} />
                <InfoRow icon={<BadgeIcon />} label={t('clients.cin')} value={client.cin || '—'} />
                <InfoRow icon={<CalendarIcon />} label={t('clients.createdAt')} value={formatDateTime(client.created_at)} />
                <InfoRow icon={<CalendarIcon />} label={t('clients.updatedAt')} value={formatDateTime(client.updated_at)} />
                {client.notes && (
                  <InfoRow icon={<NotesIcon />} label={t('clients.notes')} value={client.notes} />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Side: Service Codes */}
        <Grid item xs={12} md={8}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="h6" fontWeight={700}>
                {t('codes.title')}
              </Typography>
              <Chip label={codes.length} size="small" color="primary" sx={{ fontWeight: 600 }} />
            </Box>
            <Box display="flex" alignItems="center" gap={1.5}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<PrintIcon />}
                onClick={() => handlePrint(client, codes)}
                sx={{ py: 0.8, px: 2, borderRadius: 2 }}
                disabled={codes.length === 0}
              >
                Imprimer
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                sx={{ py: 0.8, px: 2, borderRadius: 2 }}
              >
                Actualiser
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => { setEditingCode(null); setCodeError(''); setCodeFormOpen(true); }}
                sx={{ py: 0.8, px: 2, borderRadius: 2 }}
              >
                {t('codes.addCode')}
              </Button>
            </Box>
          </Box>

          {codes.length === 0 ? (
            <EmptyState
              title={t('codes.noCodes')}
              action={
                <Box display="flex" gap={1.5}>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={handleRefresh}
                  >
                    Actualiser
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => { setEditingCode(null); setCodeError(''); setCodeFormOpen(true); }}
                  >
                    {t('codes.addCode')}
                  </Button>
                </Box>
              }
            />
          ) : (
            <ServiceCodeList
              codes={codes}
              onEdit={(c) => { setEditingCode(c); setCodeError(''); setCodeFormOpen(true); }}
              onDelete={(c) => setDeleteCode(c)}
              onCopySuccess={(msg) => setNotification({ open: true, message: msg, severity: 'success' })}
              onCopyError={(err) => setNotification({ open: true, message: err, severity: 'error' })}
              refreshKey={refreshKey}
            />
          )}
        </Grid>
      </Grid>

      {/* Dialogs */}
      <ClientForm
        open={clientFormOpen}
        onClose={() => setClientFormOpen(false)}
        onSave={handleClientSave}
        client={client}
      />

      <ServiceCodeForm
        open={codeFormOpen}
        onClose={() => { setCodeFormOpen(false); setEditingCode(null); setCodeError(''); }}
        onSave={handleCodeSave}
        serviceCode={editingCode}
        clientId={clientId}
        error={codeError}
      />

      <ConfirmDialog
        open={!!deleteCode}
        title={t('codes.deleteCode')}
        message={t('codes.deleteConfirm')}
        onConfirm={handleCodeDelete}
        onCancel={() => setDeleteCode(null)}
        severity="error"
      />

      <SnackbarNotification
        notification={notification}
        onClose={() => setNotification({ ...notification, open: false })}
      />
    </Box>
  );
};

// Helper component for info rows
const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({
  icon, label, value,
}) => (
  <Box display="flex" alignItems="flex-start" gap={1.5}>
    <Box sx={{ color: 'text.secondary', mt: 0.3 }}>{icon}</Box>
    <Box>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body2" fontWeight={500} sx={{ wordBreak: 'break-word' }}>
        {value}
      </Typography>
    </Box>
  </Box>
);

export default ClientProfile;
