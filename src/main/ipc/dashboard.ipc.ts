// ============================================================
// Dashboard IPC Handler
// ============================================================
import { ipcMain } from 'electron';
import { dashboardRepository } from '../repositories/dashboard.repo';
import { IPC_CHANNELS } from '../../shared/types';

export function registerDashboardIpc(): void {
  ipcMain.handle(IPC_CHANNELS.DASHBOARD_STATS, () => {
    try {
      const stats = dashboardRepository.getStats();
      return { success: true, data: stats };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });
}
