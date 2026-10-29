// ============================================================
// Sidebar — Navigation with icons and collapsible design
// ============================================================
import React from 'react';
import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Box, Typography, Divider, Avatar,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  DeliveryDining as GlovoIcon,
  Search as SearchIcon,
  Category as ServicesIcon,
  History as ActivityIcon,
  Backup as BackupIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const DRAWER_WIDTH = 260;

interface NavItem {
  key: string;
  path: string;
  icon: React.ReactNode;
  labelKey: string;
}

const navItems: NavItem[] = [
  { key: 'dashboard', path: '/', icon: <DashboardIcon />, labelKey: 'nav.dashboard' },
  { key: 'clients', path: '/clients', icon: <PeopleIcon />, labelKey: 'nav.clients' },
  { key: 'glovo', path: '/glovo', icon: <GlovoIcon />, labelKey: 'nav.glovo' },
  { key: 'search', path: '/search', icon: <SearchIcon />, labelKey: 'nav.search' },
  { key: 'services', path: '/services', icon: <ServicesIcon />, labelKey: 'nav.services' },
  { key: 'activity', path: '/activity', icon: <ActivityIcon />, labelKey: 'nav.activityLog' },
  { key: 'backup', path: '/backup', icon: <BackupIcon />, labelKey: 'nav.backup' },
  { key: 'settings', path: '/settings', icon: <SettingsIcon />, labelKey: 'nav.settings' },
];

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          border: 'none',
        },
      }}
    >
      {/* Logo / Brand */}
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Avatar
          sx={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            width: 42,
            height: 42,
            fontSize: '1.1rem',
            fontWeight: 700,
          }}
        >
          CM
        </Avatar>
        <Box>
          <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
            Client Manager
          </Typography>
          <Typography variant="caption" color="text.secondary">
            v1.0.0
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ mx: 2, opacity: 0.5 }} />

      {/* Navigation Items */}
      <List sx={{ px: 1.5, pt: 1.5, flex: 1 }}>
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <ListItem key={item.key} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2.5,
                  py: 1.2,
                  px: 1.5,
                  transition: 'all 0.2s ease',
                  ...(active && {
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.1) 100%)',
                    '& .MuiListItemIcon-root': { color: '#818cf8' },
                    '& .MuiListItemText-primary': {
                      color: '#818cf8',
                      fontWeight: 600,
                    },
                  }),
                  '&:hover': {
                    background: active
                      ? 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.15) 100%)'
                      : 'rgba(99,102,241,0.08)',
                    transform: 'translateX(4px)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: active ? '#818cf8' : 'text.secondary',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={t(item.labelKey)}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: active ? 600 : 400,
                  }}
                />
                {active && (
                  <Box
                    sx={{
                      width: 4,
                      height: 24,
                      borderRadius: 2,
                      background: 'linear-gradient(180deg, #6366f1, #8b5cf6)',
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
};

export default Sidebar;
