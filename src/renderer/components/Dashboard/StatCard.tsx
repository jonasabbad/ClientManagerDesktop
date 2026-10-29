// ============================================================
// StatCard — Dashboard statistics card with gradient background
// ============================================================
import React from 'react';
import { Card, CardContent, Box, Typography } from '@mui/material';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  gradient: string;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, gradient, subtitle }) => {
  return (
    <Card
      sx={{
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: gradient,
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={500} gutterBottom>
              {title}
            </Typography>
            <Typography variant="h3" fontWeight={700} sx={{ mb: 0.5 }}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: gradient,
              opacity: 0.9,
              color: '#fff',
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;
