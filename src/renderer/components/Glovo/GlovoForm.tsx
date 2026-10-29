// ============================================================
// GlovoForm — Updated for independent Rider fields (phone, email, city, notes)
// ============================================================
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box, IconButton, Alert,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { GlovoRider, CreateGlovoRiderInput, UpdateGlovoRiderInput } from '../../types';

interface GlovoFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (input: CreateGlovoRiderInput | UpdateGlovoRiderInput) => void;
  account?: GlovoRider | null;
  error?: string;
  loading?: boolean;
}

const GlovoForm: React.FC<GlovoFormProps> = ({
  open, onClose, onSave, account, error, loading,
}) => {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    rider_name: '',
    rider_id: '',
    phone: '',
    email: '',
    city: '',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (account) {
      setForm({
        rider_name: account.rider_name || '',
        rider_id: account.rider_id || '',
        phone: account.phone || '',
        email: account.email || '',
        city: account.city || '',
        notes: account.notes || '',
      });
    } else {
      setForm({ rider_name: '', rider_id: '', phone: '', email: '', city: '', notes: '' });
    }
    setFormErrors({});
  }, [account, open]);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!form.rider_id.trim()) errors.rider_id = t('app.required');
    if (!form.rider_name.trim()) errors.rider_name = t('app.required');
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = 'Email invalide';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    if (account) {
      onSave({ id: account.id, ...form } as UpdateGlovoRiderInput);
    } else {
      onSave(form as CreateGlovoRiderInput);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {account ? t('glovo.editAccount') : t('glovo.addAccount')}
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={2.5} pt={1}>
          {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
          
          <TextField
            label={t('glovo.riderName')}
            value={form.rider_name}
            onChange={(e) => setForm({ ...form, rider_name: e.target.value })}
            error={!!formErrors.rider_name}
            helperText={formErrors.rider_name}
            fullWidth
            required
            autoFocus
          />

          <TextField
            label={t('glovo.riderId')}
            value={form.rider_id}
            onChange={(e) => setForm({ ...form, rider_id: e.target.value })}
            error={!!formErrors.rider_id}
            helperText={formErrors.rider_id}
            fullWidth
            required
          />

          <TextField
            label={t('glovo.phone')}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            fullWidth
          />

          <TextField
            label="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={!!formErrors.email}
            helperText={formErrors.email}
            fullWidth
            type="email"
          />

          <TextField
            label="Ville"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            fullWidth
          />

          <TextField
            label={t('glovo.notes')}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            fullWidth
            multiline
            rows={3}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">{t('app.cancel')}</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>{t('app.save')}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default GlovoForm;

