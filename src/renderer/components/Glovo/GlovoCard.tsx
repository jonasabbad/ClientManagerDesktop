// ============================================================
// GlovoCard — Displays Glovo account info for a client
// ============================================================
import React from 'react';
import { Card, CardContent, Typography, Box, IconButton, Chip, Tooltip } from '@mui/material';
import {
  DeliveryDining as GlovoIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { GlovoRider } from '../../types';

interface GlovoCardProps {
  account: GlovoRider | null;
  onEdit: () => void;
  onDelete: () => void;
  onAdd: () => void;
}

const GlovoCard: React.FC<GlovoCardProps> = ({ account, onEdit, onDelete, onAdd }) => {
  const { t } = useTranslation();

  if (!account) {
    return (
      <Card
        sx={{
          border: '2px dashed',
          borderColor: 'divider',
          cursor: 'pointer',
          transition: 'all 0.2s',
          '&:hover': { borderColor: '#ffc244', bgcolor: 'rgba(255,194,68,0.05)' },
        }}
        onClick={onAdd}
      >
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <GlovoIcon sx={{ fontSize: 40, color: '#ffc244', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {t('glovo.addAccount')}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        background: 'linear-gradient(135deg, rgba(255,194,68,0.08) 0%, rgba(255,194,68,0.02) 100%)',
        border: '1px solid rgba(255,194,68,0.2)',
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: 44, height: 44, borderRadius: 2,
                bgcolor: '#ffc244', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <GlovoIcon sx={{ color: '#1a1a1a' }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>Glovo</Typography>
              <Chip label={`ID: ${account.rider_id}`} size="small" color="warning" variant="outlined" />
            </Box>
          </Box>
          <Box>
            <Tooltip title={t('app.edit')}>
              <IconButton size="small" onClick={onEdit}><EditIcon fontSize="small" /></IconButton>
            </Tooltip>
            <Tooltip title={t('app.delete')}>
              <IconButton size="small" onClick={onDelete} color="error"><DeleteIcon fontSize="small" /></IconButton>
            </Tooltip>
          </Box>
        </Box>
        {account.rider_name && (
          <Box mt={2}>
            <Typography variant="caption" color="text.secondary">{t('glovo.riderName')}</Typography>
            <Typography variant="body2" fontWeight={500}>{account.rider_name}</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default GlovoCard;
