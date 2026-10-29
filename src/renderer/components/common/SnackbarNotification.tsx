// ============================================================
// SnackbarNotification — Toast notifications
// ============================================================
import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import type { NotificationState } from '../../types';

interface SnackbarNotificationProps {
  notification: NotificationState;
  onClose: () => void;
}

const SnackbarNotification: React.FC<SnackbarNotificationProps> = ({
  notification, onClose,
}) => {
  return (
    <Snackbar
      open={notification.open}
      autoHideDuration={4000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        onClose={onClose}
        severity={notification.severity}
        variant="filled"
        sx={{
          borderRadius: 2,
          fontWeight: 500,
          minWidth: 300,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        }}
      >
        {notification.message}
      </Alert>
    </Snackbar>
  );
};

export default SnackbarNotification;
