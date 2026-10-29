// ============================================================
// ConfirmDialog — Reusable confirmation modal
// ============================================================
import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, Button,
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  severity?: 'warning' | 'error';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open, title, message, onConfirm, onCancel,
  confirmText, cancelText, severity = 'warning',
}) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <WarningIcon color={severity} />
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Button onClick={onCancel} variant="outlined" color="inherit">
          {cancelText || t('app.cancel')}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color={severity === 'error' ? 'error' : 'primary'}
        >
          {confirmText || t('app.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
