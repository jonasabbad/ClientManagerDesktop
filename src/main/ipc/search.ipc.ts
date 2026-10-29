// ============================================================
// Search IPC Handler
// ============================================================
import { ipcMain } from 'electron';
import { searchService } from '../services/search.service';
import { IPC_CHANNELS } from '../../shared/types';

export function registerSearchIpc(): void {
  ipcMain.handle(IPC_CHANNELS.SEARCH_GLOBAL, (_event, query: string) => {
    return searchService.search(query);
  });
}
