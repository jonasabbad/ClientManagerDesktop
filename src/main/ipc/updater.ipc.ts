// ============================================================
// Updater IPC Handler
// ============================================================
import { ipcMain } from 'electron';
import { updaterService } from '../services/updater.service';
import { IPC_CHANNELS } from '../../shared/types';

export function registerUpdaterIpc(): void {
  ipcMain.handle(IPC_CHANNELS.UPDATER_GET_STATUS, () => {
    return updaterService.getStatus();
  });

  ipcMain.handle(IPC_CHANNELS.UPDATER_CHECK, () => {
    return updaterService.check(true);
  });

  ipcMain.handle(IPC_CHANNELS.UPDATER_INSTALL, () => {
    return updaterService.install();
  });
}
