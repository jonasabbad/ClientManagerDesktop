// ============================================================
// BackupRestore Page — One-click backup, restore, and export
// ============================================================
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Button, Alert, Divider,
} from '@mui/material';
import {
  Backup as BackupIcon,
  Restore as RestoreIcon,
  TableChart as ExcelIcon,
  Description as CsvIcon,
  PictureAsPdf as PdfIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import SnackbarNotification from '../components/common/SnackbarNotification';
import type { NotificationState } from '../types';

const BackupRestore: React.FC = () => {
  const { t } = useTranslation();
  const [dbPath, setDbPath] = useState('');
  const [loading, setLoading] = useState('');
  const [notification, setNotification] = useState<NotificationState>({
    open: false, message: '', severity: 'success',
  });

  useEffect(() => {
    window.api.settings.getDbPath().then(res => {
      if (res.success) setDbPath(res.data);
    });
  }, []);

  const handleAction = async (action: string, fn: () => Promise<any>) => {
    setLoading(action);
    try {
      const response = await fn();
      if (response.success) {
        setNotification({ open: true, message: response.message || t('app.success'), severity: 'success' });
      } else if (response.error && response.error !== 'Backup canceled.' && response.error !== 'Export canceled.' && response.error !== 'Restore canceled.') {
        setNotification({ open: true, message: response.error, severity: 'error' });
      }
    } catch (err) {
      setNotification({ open: true, message: (err as Error).message, severity: 'error' });
    } finally {
      setLoading('');
    }
  };

  const actions = [
    {
      key: 'backup',
      icon: <BackupIcon sx={{ fontSize: 36 }} />,
      title: t('backup.backupDb'),
      desc: t('backup.backupDesc'),
      color: '#6366f1',
      fn: () => window.api.backup.create(),
    },
    {
      key: 'restore',
      icon: <RestoreIcon sx={{ fontSize: 36 }} />,
      title: t('backup.restoreDb'),
      desc: t('backup.restoreDesc'),
      color: '#f59e0b',
      fn: () => window.api.backup.restore(),
    },
    {
      key: 'excel',
      icon: <ExcelIcon sx={{ fontSize: 36 }} />,
      title: t('backup.exportExcel'),
      desc: t('backup.exportDesc'),
      color: '#22c55e',
      fn: () => window.api.backup.exportExcel(),
    },
    {
      key: 'csv',
      icon: <CsvIcon sx={{ fontSize: 36 }} />,
      title: t('backup.exportCsv'),
      desc: t('backup.exportDesc'),
      color: '#3b82f6',
      fn: () => window.api.backup.exportCSV(),
    },
    {
      key: 'pdf',
      icon: <PdfIcon sx={{ fontSize: 36 }} />,
      title: t('backup.exportPdf'),
      desc: t('backup.exportDesc'),
      color: '#ef4444',
      fn: () => window.api.backup.exportPDF(),
    },
  ];

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        {t('backup.title')}
      </Typography>

      <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
        {t('backup.warning')}
      </Alert>

      <Grid container spacing={3}>
        {actions.map((action) => (
          <Grid item xs={12} sm={6} md={4} key={action.key}>
            <Card
              sx={{
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0 12px 30px rgba(0,0,0,0.12)`,
                },
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Box
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: 3,
                    mx: 'auto',
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: `${action.color}15`,
                    color: action.color,
                  }}
                >
                  {action.icon}
                </Box>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {action.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  {action.desc}
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => handleAction(action.key, action.fn)}
                  disabled={loading === action.key}
                  sx={{
                    bgcolor: action.color,
                    '&:hover': { bgcolor: action.color, filter: 'brightness(0.9)' },
                  }}
                >
                  {loading === action.key ? t('app.loading') : action.title}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* DB Path Info */}
      <Divider sx={{ my: 4 }} />
      <Box display="flex" alignItems="center" gap={1.5}>
        <StorageIcon color="action" />
        <Box>
          <Typography variant="caption" color="text.secondary">{t('backup.dbPath')}</Typography>
          <Typography variant="body2" fontFamily="monospace" fontSize="0.8rem">
            {dbPath}
          </Typography>
        </Box>
      </Box>

      <SnackbarNotification
        notification={notification}
        onClose={() => setNotification({ ...notification, open: false })}
      />
    </Box>
  );
};

export default BackupRestore;
