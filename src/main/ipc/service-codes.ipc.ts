// ============================================================
// Service Codes IPC Handler
// ============================================================
import { ipcMain } from 'electron';
import { serviceCodeService } from '../services/service-code.service';
import { IPC_CHANNELS } from '../../shared/types';
import type { CreateServiceCodeInput, UpdateServiceCodeInput } from '../../shared/types';

export function registerServiceCodeIpc(): void {
  ipcMain.handle(IPC_CHANNELS.CODES_GET_BY_CLIENT, (_event, clientId: number) => {
    return serviceCodeService.getByClientId(clientId);
  });

  ipcMain.handle(IPC_CHANNELS.CODES_CREATE, (_event, input: CreateServiceCodeInput) => {
    return serviceCodeService.create(input);
  });

  ipcMain.handle(IPC_CHANNELS.CODES_UPDATE, (_event, input: UpdateServiceCodeInput) => {
    return serviceCodeService.update(input);
  });

  ipcMain.handle(IPC_CHANNELS.CODES_DELETE, (_event, id: number) => {
    return serviceCodeService.delete(id);
  });
}
