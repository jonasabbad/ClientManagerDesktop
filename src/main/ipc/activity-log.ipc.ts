// ============================================================
// Activity Log IPC Handler
// ============================================================
import { ipcMain } from 'electron';
import { activityLogRepository } from '../repositories/activity-log.repo';
import { IPC_CHANNELS } from '../../shared/types';
import type { PaginationParams } from '../../shared/types';

export function registerActivityLogIpc(): void {
  ipcMain.handle(IPC_CHANNELS.ACTIVITY_GET_ALL, (_event, params: PaginationParams) => {
    try {
      const result = activityLogRepository.getAll(params);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });
}
