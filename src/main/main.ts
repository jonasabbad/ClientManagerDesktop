import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { join } from 'path';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import { getDatabase, closeDatabase } from './database/connection';
import { runMigrations } from './database/migrations';

// Set application name explicitly
app.name = 'Client Manager';

// IPC handler registrations
import { registerClientIpc } from './ipc/clients.ipc';
import { registerServiceIpc } from './ipc/services.ipc';
import { registerServiceCodeIpc } from './ipc/service-codes.ipc';
import { registerGlovoIpc } from './ipc/glovo.ipc';
import { registerSearchIpc } from './ipc/search.ipc';
import { registerDashboardIpc } from './ipc/dashboard.ipc';
import { registerBackupIpc } from './ipc/backup.ipc';
import { registerActivityLogIpc } from './ipc/activity-log.ipc';
import { registerUpdaterIpc } from './ipc/updater.ipc';
import { updaterService } from './services/updater.service';
import { IPC_CHANNELS } from '../shared/types';

let mainWindow: BrowserWindow | null = null;

/**
 * Creates the main application window.
 */
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    title: 'Client Manager',
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/preload.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Gracefully show window when ready
  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
    mainWindow?.focus();
  });

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // Load the renderer
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

/**
 * Initialize database and register all IPC handlers.
 */
function initializeApp(): void {
  // Initialize database
  getDatabase();
  runMigrations();

  // Register all IPC handlers
  registerClientIpc();
  registerServiceIpc();
  registerServiceCodeIpc();
  registerGlovoIpc();
  registerSearchIpc();
  registerDashboardIpc();
  registerBackupIpc();
  registerActivityLogIpc();
  registerUpdaterIpc();

  // Print HTML to browser handler
  ipcMain.handle(IPC_CHANNELS.PRINT_HTML, (_event, htmlContent: string) => {
    try {
      const tempPath = join(tmpdir(), `client-manager-print-${Date.now()}.html`);
      writeFileSync(tempPath, htmlContent, 'utf-8');
      shell.openExternal(`file://${tempPath}`);
      // Auto-cleanup after 30 seconds
      setTimeout(() => {
        try { unlinkSync(tempPath); } catch { /* ignore */ }
      }, 30000);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  console.log('[App] All IPC handlers registered.');
}

// ==================== App Lifecycle ====================

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // Focus the main window if a second instance is launched
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    // Set app user model id for Windows
    electronApp.setAppUserModelId('com.agency.client-manager');

    // Optimize dev tools shortcuts
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window);
    });

    initializeApp();
    createWindow();

    // Check GitHub Releases for a newer version (installed builds only)
    updaterService.init();

    app.on('activate', () => {
      // macOS: re-create window when dock icon is clicked
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });

  // Quit when all windows are closed (except macOS)
  app.on('window-all-closed', () => {
    closeDatabase();
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  // Clean up on quit
  app.on('before-quit', () => {
    closeDatabase();
  });
}
