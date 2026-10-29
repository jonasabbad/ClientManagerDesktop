// ============================================================
// ClientForm — Create/Edit client dialog
// ============================================================
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box, IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { Client, CreateClientInput, UpdateClientInput } from '../../types';

interface ClientFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (input: CreateClientInput | UpdateClientInput) => void;
  client?: Client | null;
  loading?: boolean;
}

const ClientForm: React.FC<ClientFormProps> = ({
  open, onClose, onSave, client, loading,
}) => {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    cin: '',
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (client) {
      setForm({
        full_name: client.full_name || '',
        phone: client.phone || '',
        cin: client.cin || '',
        notes: client.notes || '',
      });
    } else {
      setForm({ full_name: '', phone: '', cin: '', notes: '' });
    }
    setErrors({});
  }, [client, open]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!form.full_name.trim()) {
      newErrors.full_name = t('app.required');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    if (client) {
      onSave({ ...form, id: client.id } as UpdateClientInput);
    } else {
      onSave(form as CreateClientInput);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {client ? t('clients.editClient') : t('clients.addClient')}
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={2.5} pt={1}>
          <TextField
            label={t('clients.fullName')}
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            error={!!errors.full_name}
            helperText={errors.full_name}
            fullWidth
            required
            autoFocus
          />
          <TextField
            label={t('clients.phone')}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            fullWidth
          />
          <TextField
            label={t('clients.cin')}
            value={form.cin}
            onChange={(e) => setForm({ ...form, cin: e.target.value })}
            fullWidth
          />
          <TextField
            label={t('clients.notes')}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            fullWidth
            multiline
            rows={3}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          {t('app.cancel')}
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          {t('app.save')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClientForm;
