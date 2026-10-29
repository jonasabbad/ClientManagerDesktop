// ============================================================
// Settings Page — Theme, Language, and App preferences
// ============================================================
import React from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Button, Chip, Divider,
  ToggleButtonGroup, ToggleButton,
} from '@mui/material';
import {
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Translate as TranslateIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useThemeMode } from '../theme/ThemeContext';
import UpdateSettingsCard from '../components/Updates/UpdateSettingsCard';
import { useUpdateStatus } from '../components/Updates/useUpdateStatus';

const Settings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { mode, toggleTheme } = useThemeMode();
  const updateStatus = useUpdateStatus();

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        {t('settings.title')}
      </Typography>

      <Grid container spacing={3}>
        {/* Theme */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                {t('settings.theme')}
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <ToggleButtonGroup
                value={mode}
                exclusive
                onChange={() => toggleTheme()}
                fullWidth
              >
                <ToggleButton value="dark" sx={{ py: 2, gap: 1 }}>
                  <DarkModeIcon />
                  {t('settings.darkMode')}
                </ToggleButton>
                <ToggleButton value="light" sx={{ py: 2, gap: 1 }}>
                  <LightModeIcon />
                  {t('settings.lightMode')}
                </ToggleButton>
              </ToggleButtonGroup>
            </CardContent>
          </Card>
        </Grid>

        {/* Language */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <TranslateIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  {t('settings.language')}
                </Typography>
              </Box>
              <Divider sx={{ mb: 3 }} />

              <Box display="flex" gap={2}>
                <Button
                  variant={i18n.language === 'fr' ? 'contained' : 'outlined'}
                  onClick={() => i18n.changeLanguage('fr')}
                  fullWidth
                  sx={{ py: 1.5 }}
                >
                  🇫🇷 {t('settings.french')}
                </Button>
                <Button
                  variant={i18n.language === 'ar' ? 'contained' : 'outlined'}
                  onClick={() => i18n.changeLanguage('ar')}
                  fullWidth
                  sx={{ py: 1.5 }}
                >
                  🇲🇦 {t('settings.arabic')}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Updates */}
        <Grid item xs={12}>
          <UpdateSettingsCard />
        </Grid>

        {/* App Info */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Application
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box display="flex" gap={1} flexWrap="wrap">
                <Chip
                  label={`Client Manager v${updateStatus?.currentVersion ?? '…'}`}
                  variant="outlined"
                />
                <Chip label="Electron + React + TypeScript" variant="outlined" />
                <Chip label="SQLite (better-sqlite3)" variant="outlined" />
                <Chip label="Material UI" variant="outlined" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Settings;
