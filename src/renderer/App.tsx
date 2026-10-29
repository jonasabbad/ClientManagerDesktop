// ============================================================
// App — Root component with routing and providers
// ============================================================
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ThemeContextProvider } from './theme/ThemeContext';
import MainLayout from './components/Layout/MainLayout';

// Pages
import Dashboard from './pages/Dashboard';
import ClientList from './pages/ClientList';
import ClientProfile from './pages/ClientProfile';
import GlovoSection from './pages/GlovoSection';
import GlovoProfile from './pages/GlovoProfile';
import SearchPage from './pages/SearchPage';
import ServicesPage from './pages/ServicesPage';
import ActivityLog from './pages/ActivityLog';
import BackupRestore from './pages/BackupRestore';
import Settings from './pages/Settings';

const App: React.FC = () => {
  return (
    <ThemeContextProvider>
      <HashRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clients" element={<ClientList />} />
            <Route path="/clients/:id" element={<ClientProfile />} />
            <Route path="/glovo" element={<GlovoSection />} />
            <Route path="/glovo/:id" element={<GlovoProfile />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/activity" element={<ActivityLog />} />
            <Route path="/backup" element={<BackupRestore />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </MainLayout>
      </HashRouter>
    </ThemeContextProvider>
  );
};

export default App;
