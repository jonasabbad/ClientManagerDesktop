// ============================================================
// Clients IPC Handler — Maps IPC channels to client service
// ============================================================
import { ipcMain } from 'electron';
import { clientService } from '../services/client.service';
import { IPC_CHANNELS } from '../../shared/types';
import type { CreateClientInput, UpdateClientInput, PaginationParams } from '../../shared/types';

export function registerClientIpc(): void {
  ipcMain.handle(IPC_CHANNELS.CLIENTS_GET_ALL, (_event, params: PaginationParams) => {
    return clientService.getAll(params);
  });

  ipcMain.handle(IPC_CHANNELS.CLIENTS_GET_BY_ID, (_event, id: number) => {
    return clientService.getById(id);
  });

  ipcMain.handle(IPC_CHANNELS.CLIENTS_CREATE, (_event, input: CreateClientInput) => {
    return clientService.create(input);
  });

  ipcMain.handle(IPC_CHANNELS.CLIENTS_UPDATE, (_event, input: UpdateClientInput) => {
    return clientService.update(input);
  });

  ipcMain.handle(IPC_CHANNELS.CLIENTS_DELETE, (_event, id: number) => {
    return clientService.delete(id);
  });
}
