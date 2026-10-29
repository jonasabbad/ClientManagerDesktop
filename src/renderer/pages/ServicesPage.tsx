// ============================================================
// ServicesPage — Updated with Categories, Sub-services & Dynamic Custom Fields
// ============================================================
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Card, CardContent, Grid,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Switch, Chip, InputAdornment, List, ListItem,
  ListItemText, ListItemSecondaryAction, Divider, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  Circle as CircleIcon,
  Delete as DeleteIcon,
  Label as LabelIcon,
  Edit as EditIcon,
  SettingsApplications as CustomFieldIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import SnackbarNotification from '../components/common/SnackbarNotification';
import ConfirmDialog from '../components/common/ConfirmDialog';
import type { ServiceCategory, ServiceSubcategory, CustomField, CustomFieldType, NotificationState } from '../types';

const ServicesPage: React.FC = () => {
  const { t } = useTranslation();
  
  // Data state
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [subcategories, setSubcategories] = useState<Record<number, ServiceSubcategory[]>>({});
  
  // Modals state
  const [catFormOpen, setCatFormOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState('#6366f1');
  
  // Custom Fields management state
  const [selectedCatForFields, setSelectedCatForFields] = useState<ServiceCategory | null>(null);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  
  // Add field form state
  const [fieldLabel, setFieldLabel] = useState('');
  const [fieldType, setFieldType] = useState<CustomFieldType>('text');
  const [fieldRequired, setFieldRequired] = useState(0);
  const [fieldPlaceholder, setFieldPlaceholder] = useState('');
  const [fieldOrder, setFieldOrder] = useState(0);
  const [editingField, setEditingField] = useState<CustomField | null>(null);

  // Add subcategory inputs state
  const [newSubNames, setNewSubNames] = useState<Record<number, string>>({});
  
  // Delete targets
  const [deleteCatTarget, setDeleteCatTarget] = useState<ServiceCategory | null>(null);
  const [deleteSubTarget, setDeleteSubTarget] = useState<ServiceSubcategory | null>(null);
  const [deleteFieldTarget, setDeleteFieldTarget] = useState<CustomField | null>(null);

  const [notification, setNotification] = useState<NotificationState>({
    open: false, message: '', severity: 'success',
  });

  const loadData = useCallback(async () => {
    const catRes = await window.api.services.getAll(false);
    if (catRes.success && catRes.data) {
      setCategories(catRes.data);
      
      const subsMap: Record<number, ServiceSubcategory[]> = {};
      await Promise.all(
        catRes.data.map(async (cat: ServiceCategory) => {
          const subRes = await window.api.services.getSubcategories(cat.id);
          if (subRes.success && subRes.data) {
            subsMap[cat.id] = subRes.data;
          }
        })
      );
      setSubcategories(subsMap);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // Load fields for modal
  const loadCustomFields = useCallback(async (catId: number) => {
    const res = await window.api.services.getCustomFields(catId);
    if (res.success && res.data) {
      setCustomFields(res.data);
    }
  }, []);

  // Category Actions
  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return;
    const response = await window.api.services.create({ name: newCatName, color: newCatColor });
    if (response.success) {
      setCatFormOpen(false);
      setNewCatName('');
      setNotification({ open: true, message: response.message!, severity: 'success' });
      loadData();
    } else {
      setNotification({ open: true, message: response.error!, severity: 'error' });
    }
  };

  const handleToggleCategory = async (id: number) => {
    await window.api.services.toggle(id);
    loadData();
  };

  const handleDeleteCategory = async () => {
    if (!deleteCatTarget) return;
    const response = await window.api.services.delete(deleteCatTarget.id);
    if (response.success) {
      setDeleteCatTarget(null);
      setNotification({ open: true, message: response.message!, severity: 'success' });
      loadData();
    } else {
      setNotification({ open: true, message: response.error!, severity: 'error' });
    }
  };

  // Subcategory Actions
  const handleAddSubcategory = async (categoryId: number) => {
    const name = newSubNames[categoryId] || '';
    if (!name.trim()) return;

    const response = await window.api.services.createSubcategory({
      category_id: categoryId,
      name: name.trim()
    });

    if (response.success) {
      setNewSubNames(prev => ({ ...prev, [categoryId]: '' }));
      setNotification({ open: true, message: response.message!, severity: 'success' });
      loadData();
    } else {
      setNotification({ open: true, message: response.error!, severity: 'error' });
    }
  };

  const handleDeleteSubcategory = async () => {
    if (!deleteSubTarget) return;
    const response = await window.api.services.deleteSubcategory(deleteSubTarget.id);
    if (response.success) {
      setDeleteSubTarget(null);
      setNotification({ open: true, message: response.message!, severity: 'success' });
      loadData();
    } else {
      setNotification({ open: true, message: response.error!, severity: 'error' });
    }
  };

  // Custom Fields Actions
  const handleOpenFieldsModal = (cat: ServiceCategory) => {
    setSelectedCatForFields(cat);
    loadCustomFields(cat.id);
    setEditingField(null);
    setFieldLabel('');
    setFieldPlaceholder('');
    setFieldOrder(0);
    setFieldRequired(0);
    setFieldType('text');
  };

  const handleEditFieldClick = (field: CustomField) => {
    setEditingField(field);
    setFieldLabel(field.label);
    setFieldType(field.type);
    setFieldRequired(field.required);
    setFieldPlaceholder(field.placeholder);
    setFieldOrder(field.display_order);
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setFieldLabel('');
    setFieldPlaceholder('');
    setFieldOrder(0);
    setFieldRequired(0);
    setFieldType('text');
  };

  const handleAddField = async () => {
    if (!selectedCatForFields || !fieldLabel.trim()) return;

    const response = editingField
      ? await window.api.services.updateCustomField(editingField.id, {
          label: fieldLabel.trim(),
          type: fieldType,
          required: fieldRequired,
          placeholder: fieldPlaceholder.trim(),
          display_order: Number(fieldOrder)
        })
      : await window.api.services.createCustomField({
          category_id: selectedCatForFields.id,
          label: fieldLabel.trim(),
          type: fieldType,
          required: fieldRequired,
          placeholder: fieldPlaceholder.trim(),
          display_order: Number(fieldOrder)
        });

    if (response.success) {
      handleCancelEdit();
      setNotification({ open: true, message: response.message!, severity: 'success' });
      loadCustomFields(selectedCatForFields.id);
    } else {
      setNotification({ open: true, message: response.error!, severity: 'error' });
    }
  };

  const handleDeleteField = async () => {
    if (!deleteFieldTarget || !selectedCatForFields) return;
    const response = await window.api.services.deleteCustomField(deleteFieldTarget.id);
    if (response.success) {
      setDeleteFieldTarget(null);
      setNotification({ open: true, message: response.message!, severity: 'success' });
      loadCustomFields(selectedCatForFields.id);
    } else {
      setNotification({ open: true, message: response.error!, severity: 'error' });
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight={700}>{t('services.title')}</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCatFormOpen(true)}>
          {t('services.addService')}
        </Button>
      </Box>

      <Grid container spacing={3}>
        {categories.map((category) => {
          const subs = subcategories[category.id] || [];
          const subInputVal = newSubNames[category.id] || '';

          return (
            <Grid item xs={12} md={6} lg={4} key={category.id}>
              <Card
                sx={{
                  opacity: category.is_active ? 1 : 0.6,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: category.color || 'primary.main',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.06)'
                  }
                }}
              >
                <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
                  {/* Category Header */}
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <CircleIcon sx={{ color: category.color || '#666', fontSize: 16 }} />
                      <Typography variant="h6" fontWeight={700}>
                        {category.name}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <Switch
                        checked={!!category.is_active}
                        onChange={() => handleToggleCategory(category.id)}
                        size="small"
                      />
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteCatTarget(category)}
                        sx={{ ml: 0.5 }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  {/* Sub-services Section */}
                  <Typography variant="subtitle2" color="text.secondary" fontWeight={600} mb={1}>
                    {t('services.subServices')} ({subs.length})
                  </Typography>

                  <Box sx={{ flex: 1, mb: 2, minHeight: 80, maxHeight: 150, overflowY: 'auto' }}>
                    {subs.length === 0 ? (
                      <Typography variant="body2" color="text.disabled" sx={{ py: 1, textAlign: 'center' }}>
                        {t('services.noSubs')}
                      </Typography>
                    ) : (
                      <List disablePadding>
                        {subs.map((sub) => (
                          <ListItem
                            key={sub.id}
                            sx={{
                              py: 0.3,
                              px: 1,
                              mb: 0.5,
                              borderRadius: 1.5,
                              bgcolor: 'action.hover',
                              '&:hover': { bgcolor: 'action.selected' }
                            }}
                          >
                            <ListItemText
                              primary={sub.name}
                              primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                            />
                            <ListItemSecondaryAction>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => setDeleteSubTarget(sub)}
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Box>

                  {/* Subcategory Add Form */}
                  {category.is_active === 1 && (
                    <Box display="flex" gap={1} mb={2}>
                      <TextField
                        size="small"
                        placeholder={t('services.addSub')}
                        value={subInputVal}
                        onChange={(e) => setNewSubNames(prev => ({ ...prev, [category.id]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddSubcategory(category.id);
                        }}
                        fullWidth
                      />
                      <Button
                        variant="outlined"
                        onClick={() => handleAddSubcategory(category.id)}
                        sx={{ px: 1.5, minWidth: 'auto' }}
                      >
                        <AddIcon fontSize="small" />
                      </Button>
                    </Box>
                  )}

                  <Divider sx={{ mb: 2 }} />

                  {/* Custom Fields trigger */}
                  <Button
                    variant="outlined"
                    startIcon={<CustomFieldIcon />}
                    onClick={() => handleOpenFieldsModal(category)}
                    fullWidth
                    color="secondary"
                    sx={{ borderRadius: 2 }}
                  >
                    {t('services.customFields')}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Add Category Dialog */}
      <Dialog open={catFormOpen} onClose={() => setCatFormOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {t('services.addService')}
          <IconButton onClick={() => setCatFormOpen(false)} size="small"><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={2.5} pt={1}>
            <TextField
              label={t('services.name')}
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              fullWidth
              required
              autoFocus
            />
            <TextField
              label={t('services.color')}
              type="color"
              value={newCatColor}
              onChange={(e) => setNewCatColor(e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CircleIcon sx={{ color: newCatColor }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCatFormOpen(false)} variant="outlined" color="inherit">{t('app.cancel')}</Button>
          <Button onClick={handleCreateCategory} variant="contained">{t('app.save')}</Button>
        </DialogActions>
      </Dialog>

      {/* Custom Fields Modal */}
      {selectedCatForFields && (
        <Dialog open={!!selectedCatForFields} onClose={() => setSelectedCatForFields(null)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box display="flex" alignItems="center" gap={1}>
              <CustomFieldIcon color="secondary" />
              <Typography variant="h6" fontWeight={700}>
                {t('services.customFields')} — {selectedCatForFields.name}
              </Typography>
            </Box>
            <IconButton onClick={() => setSelectedCatForFields(null)} size="small"><CloseIcon /></IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {/* List Table of Custom Fields */}
            <Typography variant="subtitle2" fontWeight={600} mb={1}>
              Champs Enregistrés ({customFields.length})
            </Typography>
            {customFields.length === 0 ? (
              <Typography variant="body2" color="text.disabled" align="center" sx={{ py: 3, bgcolor: 'action.hover', borderRadius: 2 }}>
                {t('services.noFields')}
              </Typography>
            ) : (
              <TableContainer component={Paper} variant="outlined" sx={{ mb: 4, borderRadius: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('services.fieldName')}</TableCell>
                      <TableCell>{t('services.fieldType')}</TableCell>
                      <TableCell>{t('services.required')}</TableCell>
                      <TableCell>{t('services.placeholder')}</TableCell>
                      <TableCell>{t('services.displayOrder')}</TableCell>
                      <TableCell align="center">{t('app.actions')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {customFields.map((field) => (
                      <TableRow key={field.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{field.label}</TableCell>
                        <TableCell>
                          <Chip label={field.type} size="small" variant="outlined" color="secondary" />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={field.required === 1 ? t('app.yes') : t('app.no')}
                            size="small"
                            color={field.required === 1 ? 'error' : 'default'}
                          />
                        </TableCell>
                        <TableCell>{field.placeholder || '—'}</TableCell>
                        <TableCell>{field.display_order}</TableCell>
                        <TableCell align="center">
                          <IconButton size="small" color="info" onClick={() => handleEditFieldClick(field)} sx={{ mr: 0.5 }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error" onClick={() => setDeleteFieldTarget(field)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Quick Add Custom Field Form */}
            <Typography variant="subtitle2" fontWeight={600} mb={2}>
              {editingField ? `Modifier le champ : ${editingField.label}` : t('services.addField')}
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={3}>
                <TextField
                  label={t('services.fieldName')}
                  value={fieldLabel}
                  onChange={(e) => setFieldLabel(e.target.value)}
                  size="small"
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={2.5}>
                <TextField
                  select
                  label={t('services.fieldType')}
                  value={fieldType}
                  onChange={(e) => setFieldType(e.target.value as CustomFieldType)}
                  size="small"
                  fullWidth
                >
                  <MenuItem value="text">Texte</MenuItem>
                  <MenuItem value="number">Nombre</MenuItem>
                  <MenuItem value="date">Date</MenuItem>
                  <MenuItem value="phone">Téléphone</MenuItem>
                  <MenuItem value="email">E-mail</MenuItem>
                  <MenuItem value="textarea">Zone de texte (Textarea)</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={2}>
                <TextField
                  select
                  label={t('services.required')}
                  value={fieldRequired}
                  onChange={(e) => setFieldRequired(Number(e.target.value))}
                  size="small"
                  fullWidth
                >
                  <MenuItem value={1}>{t('app.yes')}</MenuItem>
                  <MenuItem value={0}>{t('app.no')}</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  label={t('services.placeholder')}
                  value={fieldPlaceholder}
                  onChange={(e) => setFieldPlaceholder(e.target.value)}
                  size="small"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={1.5}>
                <TextField
                  label="Ordre"
                  type="number"
                  value={fieldOrder}
                  onChange={(e) => setFieldOrder(Number(e.target.value))}
                  size="small"
                  fullWidth
                />
              </Grid>
            </Grid>
            <Box display="flex" justifyContent="flex-end" mt={2.5} gap={1}>
              {editingField && (
                <Button variant="outlined" onClick={handleCancelEdit} color="inherit">
                  {t('app.cancel')}
                </Button>
              )}
              <Button
                variant="contained"
                startIcon={editingField ? <EditIcon /> : <AddIcon />}
                onClick={handleAddField}
                color="secondary"
              >
                {editingField ? t('app.save') : t('app.add')}
              </Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedCatForFields(null)} color="inherit">
              {t('app.close')}
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Confirm Category Delete */}
      <ConfirmDialog
        open={!!deleteCatTarget}
        title={t('app.delete')}
        message="Voulez-vous vraiment supprimer cette catégorie ? Cela supprimera tous ses sous-services, codes, champs personnalisés et valeurs associées."
        onConfirm={handleDeleteCategory}
        onCancel={() => setDeleteCatTarget(null)}
        severity="error"
      />

      {/* Confirm Subcategory Delete */}
      <ConfirmDialog
        open={!!deleteSubTarget}
        title={t('app.delete')}
        message="Voulez-vous vraiment supprimer ce sous-service ?"
        onConfirm={handleDeleteSubcategory}
        onCancel={() => setDeleteSubTarget(null)}
        severity="error"
      />

      {/* Confirm Field Delete */}
      <ConfirmDialog
        open={!!deleteFieldTarget}
        title={t('app.delete')}
        message={`Voulez-vous vraiment supprimer le champ "${deleteFieldTarget?.label}" ? Toutes ses valeurs saisies pour vos clients seront définitivement supprimées.`}
        onConfirm={handleDeleteField}
        onCancel={() => setDeleteFieldTarget(null)}
        severity="error"
      />

      <SnackbarNotification
        notification={notification}
        onClose={() => setNotification({ ...notification, open: false })}
      />
    </Box>
  );
};

export default ServicesPage;
