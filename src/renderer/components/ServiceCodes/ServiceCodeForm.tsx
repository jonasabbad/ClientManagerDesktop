// ============================================================
// ServiceCodeForm — Updated with Dynamic Custom Fields Rendering
// ============================================================
import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, Box, IconButton, Alert, CircularProgress,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { ServiceCode, CreateServiceCodeInput, UpdateServiceCodeInput, ServiceCategory, ServiceSubcategory, CustomField } from '../../types';

interface ServiceCodeFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (input: CreateServiceCodeInput | UpdateServiceCodeInput) => void;
  serviceCode?: ServiceCode | null;
  clientId: number;
  error?: string;
  loading?: boolean;
}

const ServiceCodeForm: React.FC<ServiceCodeFormProps> = ({
  open, onClose, onSave, serviceCode, clientId, error, loading,
}) => {
  const { t } = useTranslation();
  
  // Lists
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [subcategories, setSubcategories] = useState<ServiceSubcategory[]>([]);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  
  // Fetching states
  const [fetchingSubs, setFetchingSubs] = useState(false);
  const [fetchingFields, setFetchingFields] = useState(false);

  // Selections & Inputs
  const [selectedCatId, setSelectedCatId] = useState<number | ''>('');
  const [selectedSubId, setSelectedSubId] = useState<number | ''>('');
  const [codeValue, setCodeValue] = useState('');
  const [labelValue, setLabelValue] = useState('');
  const [notesValue, setNotesValue] = useState('');
  
  // Dynamic custom values input state: maps field_id to string value
  const [customValues, setCustomValues] = useState<Record<number, string>>({});
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // 1. Load active categories
  const loadCategories = useCallback(async () => {
    const res = await window.api.services.getAll(true);
    if (res.success && res.data) {
      setCategories(res.data);
    }
  }, []);

  // 2. Load subcategories for category
  const loadSubcategories = useCallback(async (catId: number) => {
    setFetchingSubs(true);
    const res = await window.api.services.getSubcategories(catId);
    if (res.success && res.data) {
      setSubcategories(res.data);
    }
    setFetchingSubs(false);
  }, []);

  // 3. Load custom fields for category
  const loadCustomFields = useCallback(async (catId: number) => {
    setFetchingFields(true);
    const res = await window.api.services.getCustomFields(catId);
    if (res.success && res.data) {
      setCustomFields(res.data);
    }
    setFetchingFields(false);
  }, []);

  // 4. Initialize / Pre-fill values
  useEffect(() => {
    if (open) {
      loadCategories().then(() => {
        if (serviceCode) {
          // Editing existing code:
          window.api.services.getSubcategories().then((res) => {
            if (res.success && res.data) {
              const matchedSub = res.data.find((sub: ServiceSubcategory) => sub.id === serviceCode.subcategory_id);
              if (matchedSub) {
                setSelectedCatId(matchedSub.category_id);
                loadSubcategories(matchedSub.category_id);
                loadCustomFields(matchedSub.category_id);
                setSelectedSubId(serviceCode.subcategory_id);
              }
            }
          });
          setCodeValue(serviceCode.code);
          setLabelValue(serviceCode.label || '');
          setNotesValue(serviceCode.notes || '');

          // Map current custom values
          const vals: Record<number, string> = {};
          serviceCode.customValues?.forEach((item) => {
            vals[item.field_id] = item.value;
          });
          setCustomValues(vals);
        } else {
          // Creating new:
          setSelectedCatId('');
          setSelectedSubId('');
          setSubcategories([]);
          setCustomFields([]);
          setCodeValue('');
          setLabelValue('');
          setNotesValue('');
          setCustomValues({});
        }
      });
      setFormErrors({});
    }
  }, [open, serviceCode, loadCategories, loadSubcategories, loadCustomFields]);

  // Handle category change
  const handleCategoryChange = (catId: number) => {
    setSelectedCatId(catId);
    setSelectedSubId('');
    setSubcategories([]);
    setCustomFields([]);
    setCustomValues({});
    loadSubcategories(catId);
    loadCustomFields(catId);
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!selectedCatId) errors.category = t('app.required');
    if (subcategories.length > 0 && !selectedSubId) errors.subcategory = t('app.required');
    if (!codeValue.trim()) errors.code = t('app.required');

    // Dynamic field validation
    customFields.forEach((field) => {
      if (field.required === 1) {
        const val = customValues[field.id];
        if (!val || val.trim().length === 0) {
          errors[`field_${field.id}`] = t('app.required');
        }
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    // Convert values state to array representation
    const mappedValues = Object.entries(customValues).map(([fieldId, val]) => ({
      field_id: Number(fieldId),
      value: val
    }));

    if (serviceCode) {
      onSave({
        id: serviceCode.id,
        category_id: selectedCatId ? Number(selectedCatId) : undefined,
        subcategory_id: selectedSubId ? Number(selectedSubId) : undefined,
        code: codeValue,
        label: labelValue,
        notes: notesValue,
        customValues: mappedValues,
      } as UpdateServiceCodeInput);
    } else {
      onSave({
        client_id: clientId,
        category_id: selectedCatId ? Number(selectedCatId) : undefined,
        subcategory_id: selectedSubId ? Number(selectedSubId) : undefined,
        code: codeValue,
        label: labelValue,
        notes: notesValue,
        customValues: mappedValues,
      } as CreateServiceCodeInput);
    }
  };

  const renderCustomFieldInput = (field: CustomField) => {
    const value = customValues[field.id] || '';
    const hasError = !!formErrors[`field_${field.id}`];

    const handleChange = (val: string) => {
      setCustomValues(prev => ({ ...prev, [field.id]: val }));
    };

    switch (field.type) {
      case 'textarea':
        return (
          <TextField
            key={field.id}
            label={field.label}
            placeholder={field.placeholder}
            required={field.required === 1}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            error={hasError}
            helperText={hasError ? t('app.required') : ''}
            fullWidth
            multiline
            rows={3}
          />
        );
      case 'date':
        return (
          <TextField
            key={field.id}
            type="date"
            label={field.label}
            required={field.required === 1}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            error={hasError}
            helperText={hasError ? t('app.required') : ''}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        );
      default:
        // text, number, phone, email
        return (
          <TextField
            key={field.id}
            type={field.type === 'phone' ? 'tel' : field.type}
            label={field.label}
            placeholder={field.placeholder}
            required={field.required === 1}
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            error={hasError}
            helperText={hasError ? t('app.required') : ''}
            fullWidth
          />
        );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {serviceCode ? t('codes.editCode') : t('codes.addCode')}
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={2.5} pt={1}>
          {error && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {/* Select Category */}
          <TextField
            select
            label={t('codes.serviceType')}
            value={selectedCatId}
            onChange={(e) => handleCategoryChange(Number(e.target.value))}
            error={!!formErrors.category}
            helperText={formErrors.category}
            fullWidth
            required
          >
            {categories.map(c => (
              <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
            ))}
          </TextField>

          {/* Select Sub-Service */}
          {selectedCatId && (subcategories.length > 0 || fetchingSubs) && (
            <TextField
              select
              label={t('codes.subServiceType')}
              value={selectedSubId}
              onChange={(e) => setSelectedSubId(Number(e.target.value))}
              error={!!formErrors.subcategory}
              helperText={formErrors.subcategory}
              disabled={fetchingSubs}
              fullWidth
              required
              InputProps={{
                endAdornment: fetchingSubs ? <CircularProgress size={20} /> : null
              }}
            >
              {subcategories.map(s => (
                <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
              ))}
            </TextField>
          )}

          {/* Service Code */}
          <TextField
            label={t('codes.code')}
            value={codeValue}
            onChange={(e) => setCodeValue(e.target.value)}
            error={!!formErrors.code}
            helperText={formErrors.code}
            fullWidth
            required
          />

          {/* Dynamic Custom Fields rendering */}
          {selectedCatId && (fetchingFields || customFields.length > 0) && (
            <Box display="flex" flexDirection="column" gap={2}>
              {fetchingFields ? (
                <Box display="flex" justifyContent="center" py={2}><CircularProgress size={24} /></Box>
              ) : (
                customFields.map((field) => renderCustomFieldInput(field))
              )}
            </Box>
          )}

          <TextField
            label={t('codes.label')}
            value={labelValue}
            onChange={(e) => setLabelValue(e.target.value)}
            fullWidth
          />

          <TextField
            label={t('codes.notes')}
            value={notesValue}
            onChange={(e) => setNotesValue(e.target.value)}
            fullWidth
            multiline
            rows={2}
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

export default ServiceCodeForm;
