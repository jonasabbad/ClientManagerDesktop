// ============================================================
// Dashboard Page — Statistics overview (Updated)
// ============================================================
import React, { useEffect, useState } from 'react';
import { Box, Grid, Typography, CircularProgress } from '@mui/material';
import {
  People as PeopleIcon,
  Code as CodeIcon,
  TrendingUp as TodayIcon,
  DeliveryDining as GlovoIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import StatCard from '../components/Dashboard/StatCard';
import RecentClients from '../components/Dashboard/RecentClients';
import ServiceChart from '../components/Dashboard/ServiceChart';
import type { DashboardStats } from '../types';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await window.api.dashboard.getStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        {t('dashboard.title')}
      </Typography>

      {/* Stat Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('dashboard.totalClients')}
            value={stats.totalClients}
            icon={<PeopleIcon />}
            gradient="linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('dashboard.totalCodes')}
            value={stats.totalCodes}
            icon={<CodeIcon />}
            gradient="linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('dashboard.todayNew')}
            value={stats.todayNewClients}
            icon={<TodayIcon />}
            gradient="linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={t('dashboard.glovoAccounts')}
            value={stats.totalGlovoRiders}
            icon={<GlovoIcon />}
            gradient="linear-gradient(135deg, #ffc244 0%, #ff9800 100%)"
          />
        </Grid>
      </Grid>

      {/* Charts + Recent */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <ServiceChart data={stats.codesPerService} />
        </Grid>
        <Grid item xs={12} md={5}>
          <RecentClients clients={stats.latestClients} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
