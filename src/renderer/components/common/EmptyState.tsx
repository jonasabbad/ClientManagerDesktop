// ============================================================
// EmptyState — Placeholder for empty lists
// ============================================================
import React from 'react';
import { Box, Typography } from '@mui/material';
import { Inbox as InboxIcon } from '@mui/icons-material';

interface EmptyStateProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title, subtitle, icon, action,
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 3,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'action.hover',
          mb: 3,
        }}
      >
        {icon || <InboxIcon sx={{ fontSize: 40, color: 'text.secondary' }} />}
      </Box>
      <Typography variant="h6" gutterBottom color="text.primary">
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary" maxWidth={400}>
          {subtitle}
        </Typography>
      )}
      {action && <Box mt={3}>{action}</Box>}
    </Box>
  );
};

export default EmptyState;
