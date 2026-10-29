// ============================================================
// MainLayout — Sidebar + TopBar + Content area
// ============================================================
import React from 'react';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import UpdateNotifier from '../Updates/UpdateNotifier';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <TopBar />
        <Box
          component="main"
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 3,
          }}
        >
          {children}
        </Box>
      </Box>
      <UpdateNotifier />
    </Box>
  );
};

export default MainLayout;
