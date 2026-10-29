// ============================================================
// UpdateSettingsCard — Version info + manual "check for updates"
// ============================================================
import React, { useState } from 'react';
import {
  Alert, Box, Button, Card, CardContent, Chip, Divider, LinearProgress, Typography,
} from '@mui/material';
import {
  SystemUpdateAlt as UpdateIcon,
  Refresh as RefreshIcon,
  RestartAlt as RestartIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useUpdateStatus } from './useUpdateStatus';

const UpdateSettingsCard: React.FC = () => {
  const { t } = useTranslation();
  const status = useUpdateStatus();
  const [requested, setRequested] = useState(false);
  const [installing, setInstalling] = useState(false);

  const state = status?.state;
  const busy = state === 'checking' || state === 'available' || state === 'downloading';

  const handleCheck = async () => {
    setRequested(true);
    try {
      await window.api.updater.check();
    } catch {
      // The status event carries the error.
    }
  };

  const handleInstall = async () => {
    setInstalling(true);
    try {
      await window.api.updater.install();
    } catch {
      setInstalling(false);
    }
  };

  const renderStatus = () => {
    if (!status) return null;
    switch (status.state) {
      case 'disabled':
        return <Alert severity="info">{t('settings.updates.devMode')}</Alert>;
      case 'checking':
        return <Alert severity="info">{t('settings.updates.checking')}</Alert>;
      case 'not-available':
        return <Alert severity="success">{t('settings.updates.upToDate')}</Alert>;
      case 'available':
      case 'downloading':
        return (
          <Alert severity="info" sx={{ '& .MuiAlert-message': { width: '100%' } }}>
            {t('settings.updates.available', { version: status.version })}
            <Typography variant="caption" display="block" mt={0.5}>
              {t('settings.updates.downloading', { percent: status.percent ?? 0 })}
            </Typography>
            <LinearProgress variant="determinate" value={status.percent ?? 0} sx={{ mt: 1 }} />
          </Alert>
        );
      case 'downloaded':
        return (
          <Alert severity="success">
            {t('settings.updates.downloaded', { version: status.version })}
            {status.waitingForDb && (
              <Typography variant="caption" display="block" mt={0.5}>
                {t('settings.updates.busy')}
              </Typography>
            )}
          </Alert>
        );
      case 'error':
        // The automatic startup check fails silently; show errors once the user asks.
        if (!requested && !status.manual) return null;
        return (
          <Alert severity={status.errorKind === 'offline' ? 'warning' : 'error'}>
            {status.errorKind === 'offline'
              ? t('settings.updates.offline')
              : t('settings.updates.error', { message: status.error ?? '' })}
          </Alert>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <UpdateIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>
            {t('settings.updates.title')}
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />

        <Box display="flex" alignItems="center" gap={2} flexWrap="wrap" mb={2}>
          <Typography variant="body2" color="text.secondary">
            {t('settings.updates.currentVersion')}
          </Typography>
          <Chip label={`v${status?.currentVersion ?? '…'}`} size="small" variant="outlined" />
          <Box flex={1} />
          {state === 'downloaded' ? (
            <Button
              variant="contained"
              startIcon={<RestartIcon />}
              onClick={handleInstall}
              disabled={installing}
            >
              {t('settings.updates.restart')}
            </Button>
          ) : (
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleCheck}
              disabled={!status || state === 'disabled' || busy}
            >
              {t('settings.updates.check')}
            </Button>
          )}
        </Box>

        {renderStatus()}

        <Typography variant="caption" color="text.secondary" display="block" mt={2}>
          {t('settings.updates.autoNote')}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default UpdateSettingsCard;
