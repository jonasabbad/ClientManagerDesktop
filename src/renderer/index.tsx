// ============================================================
// React Entry Point
// ============================================================
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './i18n/i18n';

// Type declaration for the preload API
declare global {
  interface Window {
    api: import('../preload/preload').ElectronAPI;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
