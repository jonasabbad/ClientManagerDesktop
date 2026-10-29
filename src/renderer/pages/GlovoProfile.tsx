// ============================================================
// GlovoProfile Page — Rider detail view (mirrors ClientProfile)
// ============================================================
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Button, Chip,
  Divider, IconButton, CircularProgress, Breadcrumbs, Link, CardHeader,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  CalendarToday as CalendarIcon,
  Notes as NotesIcon,
  Email as EmailIcon,
  LocationCity as CityIcon,
  DeliveryDining as GlovoIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import GlovoForm from '../components/Glovo/GlovoForm';
import ConfirmDialog from '../components/common/ConfirmDialog';
import SnackbarNotification from '../components/common/SnackbarNotification';
import CopyableId from '../components/common/CopyableId';
import EmptyState from '../components/common/EmptyState';
import { usePrintServiceCodes } from '../components/ServiceCodes/PrintServiceCodes';
import { formatDateTime } from '../utils/formatters';
import type {
  GlovoRider,
  CreateGlovoRiderInput, UpdateGlovoRiderInput, NotificationState,
} from '../types';

const GlovoProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [rider, setRider] = useState<GlovoRider | null>(null);
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [notification, setNotification] = useState<NotificationState>({
    open: false, message: '', severity: 'success',
  });

  const riderId = Number(id);
  const { handlePrintRider } = usePrintServiceCodes();

  const loadData = useCallback(async () => {
    if (!riderId) return;
    setLoading(true);
    try {
      const res = await window.api.glovo.getById(riderId);
      if (res.success && res.data) setRider(res.data);
    } catch (err) {
      console.error('Failed to load rider data:', err);
    } finally {
      setLoading(false);
    }
  }, [riderId]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleSave = async (input: CreateGlovoRiderInput | UpdateGlovoRiderInput) => {
    const response = await window.api.glovo.update(input as UpdateGlovoRiderInput);
    if (response.success) {
      setFormOpen(false);
      setNotification({ open: true, message: response.message!, severity: 'success' });
      loadData();
    } else {
      setNotification({ open: true, message: response.error!, severity: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!rider) return;
    const response = await window.api.glovo.delete(rider.id);
    if (response.success) {
      setDeleteOpen(false);
      setNotification({ open: true, message: response.message!, severity: 'success' });
      setTimeout(() => navigate('/glovo'), 500);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (!rider) {
    return <EmptyState title="Rider not found" />;
  }

  return (
    <Box>
      {/* Breadcrumbs */}
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <IconButton onClick={() => navigate('/glovo')} size="small">
          <BackIcon />
        </IconButton>
        <Breadcrumbs>
          <Link
            component="button"
            underline="hover"
            color="text.secondary"
            onClick={() => navigate('/glovo')}
            sx={{ cursor: 'pointer' }}
          >
            {t('glovo.title')}
          </Link>
          <Typography color="text.primary" fontWeight={600}>
            {rider.rider_name}
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Profile Card */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
            <CardHeader
              title={
                <Box display="flex" alignItems="center" gap={1}>
                  <GlovoIcon sx={{ color: '#ffc244' }} />
                  <span>Informations du Rider</span>
                </Box>
              }
              titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }}
              action={
                <Box display="flex" gap={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<PrintIcon />}
                    onClick={() => handlePrintRider(rider)}
                    sx={{ borderRadius: 2 }}
                  >
                    Imprimer
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => setFormOpen(true)}
                    sx={{ borderRadius: 2 }}
                  >
                    {t('app.edit')}
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    onClick={() => setDeleteOpen(true)}
                    sx={{ borderRadius: 2 }}
                  >
                    {t('app.delete')}
                  </Button>
                </Box>
              }
            />
            <Divider />
            <CardContent sx={{ pt: 2 }}>
              <Box display="flex" flexDirection="column" gap={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary">ID</Typography>
                  <Box mt={0.5}>
                    <Chip label={`#${rider.id}`} size="small" variant="outlined" />
                  </Box>
                </Box>
                <InfoRow icon={<PersonIcon />} label={t('glovo.riderName')} value={rider.rider_name} />
                <InfoRow icon={<BadgeIcon />} label={t('glovo.riderId')} value={rider.rider_id} />
                <InfoRow icon={<PhoneIcon />} label={t('glovo.phone')} value={rider.phone || '—'} />
                <InfoRow icon={<EmailIcon />} label="Email" value={rider.email || '—'} />
                <InfoRow icon={<CityIcon />} label="Ville" value={rider.city || '—'} />
                <InfoRow icon={<CalendarIcon />} label={t('clients.createdAt')} value={formatDateTime(rider.created_at)} />
                <InfoRow icon={<CalendarIcon />} label={t('clients.updatedAt')} value={formatDateTime(rider.updated_at)} />
                {rider.notes && (
                  <InfoRow icon={<NotesIcon />} label={t('glovo.notes')} value={rider.notes} />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Side: Summary / Stats placeholder */}
        <Grid item xs={12} md={6}>
          <Card sx={{ border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <CardHeader
              title="Résumé"
              titleTypographyProps={{ variant: 'subtitle1', fontWeight: 700 }}
            />
            <Divider />
            <CardContent>
              <Box display="flex" flexDirection="column" gap={2} alignItems="center" justifyContent="center" minHeight={200}>
                <GlovoIcon sx={{ fontSize: 64, color: '#ffc244', opacity: 0.4 }} />
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Profil du rider Glovo
                </Typography>
                <CopyableId
                  key={rider.id}
                  value={rider.rider_id}
                  persistent
                  sx={{
                    bgcolor: '#ffc244',
                    color: '#1a1a1a',
                    fontWeight: 700,
                    fontSize: '1rem',
                    py: 1,
                    px: 2,
                    '&:hover': { bgcolor: '#e0ab3b' },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialogs */}
      <GlovoForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        account={rider}
      />

      <ConfirmDialog
        open={deleteOpen}
        title={t('glovo.deleteAccount')}
        message={t('glovo.deleteConfirm')}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
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

export default GlovoProfile;
