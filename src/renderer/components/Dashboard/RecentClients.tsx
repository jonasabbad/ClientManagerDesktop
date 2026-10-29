// ============================================================
// RecentClients — Shows latest clients in a compact list
// ============================================================
import React from 'react';
import {
  Card, CardContent, Typography, List, ListItem, ListItemAvatar,
  ListItemText, Avatar, Box, Chip, IconButton,
} from '@mui/material';
import { Visibility as ViewIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { formatRelativeTime } from '../../utils/formatters';
import type { Client } from '../../types';

interface RecentClientsProps {
  clients: Client[];
}

const RecentClients: React.FC<RecentClientsProps> = ({ clients }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(w => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const colors = [
    '#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6',
    '#06b6d4', '#ef4444', '#22c55e', '#f97316', '#3b82f6',
  ];

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ p: 0 }}>
        <Box sx={{ p: 2.5, pb: 1 }}>
          <Typography variant="h6" fontWeight={600}>
            {t('dashboard.recentClients')}
          </Typography>
        </Box>
        <List disablePadding>
          {clients.map((client, index) => (
            <ListItem
              key={client.id}
              sx={{
                px: 2.5,
                py: 1,
                transition: 'background 0.15s',
                '&:hover': { bgcolor: 'action.hover' },
              }}
              secondaryAction={
                <IconButton
                  size="small"
                  onClick={() => navigate(`/clients/${client.id}`)}
                >
                  <ViewIcon fontSize="small" />
                </IconButton>
              }
            >
              <ListItemAvatar>
                <Avatar
                  sx={{
                    bgcolor: colors[index % colors.length],
                    width: 38,
                    height: 38,
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}
                >
                  {getInitials(client.full_name)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={client.full_name}
                secondary={client.phone || '—'}
                primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 500 }}
                secondaryTypographyProps={{ fontSize: '0.75rem' }}
              />
              <Chip
                label={formatRelativeTime(client.created_at)}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem', mr: 4 }}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default RecentClients;
