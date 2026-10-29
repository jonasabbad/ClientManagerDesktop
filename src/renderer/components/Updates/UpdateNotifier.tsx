// ============================================================
// UpdateNotifier — App-wide download progress + restart prompt
// ============================================================
import React, { useState } from 'react';
import {
  Box, Button, Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, LinearProgress, Paper, Snackbar, Typography,
} from '@mui/material';
import { SystemUpdateAlt as UpdateIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useUpdateStatus } from './useUpdateStatus';

// Remember "Later" per version for this session so the prompt is shown once.
const DISMISSED_KEY = 'updater.dismissedVersion';

function readDismissed(): string | null {
  try { return sessionStorage.getItem(DISMISSED_KEY); } catch { return null; }
}

const UpdateNotifier: React.FC = () => {
  const { t } = useTranslation();
  const status = useUpdateStatus();
  const [dismissedVersion, setDismissedVersion] = useState<string | null>(readDismissed);
  const [installing, setInstalling] = useState(false);

  if (!status) return null;

  const downloading = status.state === 'available' || status.state === 'downloading';
  const promptOpen =
    status.state === 'downloaded' && !!status.version && status.version !== dismissedVersion;

  const handleLater = () => {
    const version = status.version ?? null;
    setDismissedVersion(version);
    try { if (version) sessionStorage.setItem(DISMISSED_KEY, version); } catch { /* ignore */ }
  };

  const handleRestart = async () => {
    setInstalling(true);
    try {
      await window.api.updater.install();
    } catch {
      setInstalling(false);
    }
  };

  return (
    <>
      <Snackbar open={downloading} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Paper elevation={6} sx={{ p: 2, width: 320, border: '1px solid', borderColor: 'divider' }}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <UpdateIcon color="primary" fontSize="small" />
            <Typography variant="body2" fontWeight={600}>
              {t('settings.updates.available', { version: status.version })}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {t('settings.updates.downloading', { percent: status.percent ?? 0 })}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={status.percent ?? 0}
            sx={{ mt: 1, borderRadius: 1 }}
          />
        </Paper>
      </Snackbar>

      <Dialog open={promptOpen} onClose={installing ? undefined : handleLater} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <UpdateIcon color="primary" />
          {t('settings.updates.title')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('settings.updates.restartPrompt', { version: status.version })}
          </DialogContentText>
          {status.waitingForDb && (
            <Typography variant="body2" color="warning.main" mt={2}>
              {t('settings.updates.busy')}
            </Typography>
          )}
          {installing && <LinearProgress sx={{ mt: 2 }} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLater} disabled={installing}>
            {t('settings.updates.later')}
          </Button>
          <Button variant="contained" onClick={handleRestart} disabled={installing}>
            {t('settings.updates.restart')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UpdateNotifier;
