// ============================================================
// Glovo Riders IPC Handler — Decoupled independent module
// ============================================================
import { ipcMain } from 'electron';
import { glovoService } from '../services/glovo.service';
import { IPC_CHANNELS } from '../../shared/types';
import type { CreateGlovoRiderInput, UpdateGlovoRiderInput, PaginationParams } from '../../shared/types';

export function registerGlovoIpc(): void {
  ipcMain.handle(IPC_CHANNELS.GLOVO_RIDER_GET_ALL, (_event, params: PaginationParams) => {
    return glovoService.getAll(params);
  });

  ipcMain.handle(IPC_CHANNELS.GLOVO_RIDER_GET_BY_ID, (_event, id: number) => {
    return glovoService.getById(id);
  });

  ipcMain.handle(IPC_CHANNELS.GLOVO_RIDER_CREATE, (_event, input: CreateGlovoRiderInput) => {
    return glovoService.create(input);
  });

  ipcMain.handle(IPC_CHANNELS.GLOVO_RIDER_UPDATE, (_event, input: UpdateGlovoRiderInput) => {
    return glovoService.update(input);
  });

  ipcMain.handle(IPC_CHANNELS.GLOVO_RIDER_DELETE, (_event, id: number) => {
    return glovoService.delete(id);
  });
}
