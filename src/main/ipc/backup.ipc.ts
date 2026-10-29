// ============================================================
// Backup IPC Handler
// ============================================================
import { ipcMain } from 'electron';
import { backupService } from '../services/backup.service';
import { getDbPath } from '../database/connection';
import { runCriticalDbOperation } from '../database/operation-lock';
import { IPC_CHANNELS } from '../../shared/types';

export function registerBackupIpc(): void {
  ipcMain.handle(IPC_CHANNELS.BACKUP_CREATE, () => {
    return runCriticalDbOperation(() => backupService.createBackup());
  });

  ipcMain.handle(IPC_CHANNELS.BACKUP_RESTORE, async () => {
    const res = await runCriticalDbOperation(() => backupService.restoreBackup());
    if (res.success) {
      const { app } = await import('electron');
      setTimeout(() => {
        app.relaunch();
        app.exit(0);
      }, 1500);
    }
    return res;
  });

  ipcMain.handle(IPC_CHANNELS.EXPORT_EXCEL, () => {
    return runCriticalDbOperation(() => backupService.exportExcel());
  });

  ipcMain.handle(IPC_CHANNELS.EXPORT_CSV, () => {
    return runCriticalDbOperation(() => backupService.exportCSV());
  });

  ipcMain.handle(IPC_CHANNELS.EXPORT_PDF, () => {
    return runCriticalDbOperation(() => backupService.exportPDF());
  });

  ipcMain.handle(IPC_CHANNELS.SETTINGS_GET_DB_PATH, () => {
    return { success: true, data: getDbPath() };
  });
}
