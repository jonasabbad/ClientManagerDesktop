// ============================================================
// Preload Script — Secure bridge between Main and Renderer (Updated with Custom Fields)
// ============================================================
import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../shared/types';
import type {
  CreateClientInput,
  UpdateClientInput,
  PaginationParams,
  CreateServiceCategoryInput,
  CreateServiceSubcategoryInput,
  CreateCustomFieldInput,
  CreateServiceCodeInput,
  UpdateServiceCodeInput,
  CreateGlovoRiderInput,
  UpdateGlovoRiderInput,
  UpdateStatus,
} from '../shared/types';

/**
 * Exposed API available in the renderer as `window.api`.
 */
const api = {
  // ==================== Clients ====================
  clients: {
    getAll: (params: PaginationParams) =>
      ipcRenderer.invoke(IPC_CHANNELS.CLIENTS_GET_ALL, params),
    getById: (id: number) =>
      ipcRenderer.invoke(IPC_CHANNELS.CLIENTS_GET_BY_ID, id),
    create: (input: CreateClientInput) =>
      ipcRenderer.invoke(IPC_CHANNELS.CLIENTS_CREATE, input),
    update: (input: UpdateClientInput) =>
      ipcRenderer.invoke(IPC_CHANNELS.CLIENTS_UPDATE, input),
    delete: (id: number) =>
      ipcRenderer.invoke(IPC_CHANNELS.CLIENTS_DELETE, id),
  },

  // ==================== Service Categories & Subcategories & Custom Fields ====================
  services: {
    getAll: (activeOnly?: boolean) =>
      ipcRenderer.invoke(IPC_CHANNELS.SERVICES_GET_ALL, activeOnly),
    create: (input: CreateServiceCategoryInput) =>
      ipcRenderer.invoke(IPC_CHANNELS.SERVICES_CREATE, input),
    update: (id: number, input: Partial<CreateServiceCategoryInput>) =>
      ipcRenderer.invoke(IPC_CHANNELS.SERVICES_UPDATE, id, input),
    toggle: (id: number) =>
      ipcRenderer.invoke(IPC_CHANNELS.SERVICES_TOGGLE, id),
    delete: (id: number) =>
      ipcRenderer.invoke(IPC_CHANNELS.SERVICES_DELETE, id),
    
    getSubcategories: (categoryId?: number) =>
      ipcRenderer.invoke(IPC_CHANNELS.SUBCATEGORIES_GET_ALL, categoryId),
    createSubcategory: (input: CreateServiceSubcategoryInput) =>
      ipcRenderer.invoke(IPC_CHANNELS.SUBCATEGORIES_CREATE, input),
    deleteSubcategory: (id: number) =>
      ipcRenderer.invoke(IPC_CHANNELS.SUBCATEGORIES_DELETE, id),

    getCustomFields: (categoryId: number) =>
      ipcRenderer.invoke(IPC_CHANNELS.CUSTOM_FIELDS_GET_BY_CATEGORY, categoryId),
    createCustomField: (input: CreateCustomFieldInput) =>
      ipcRenderer.invoke(IPC_CHANNELS.CUSTOM_FIELDS_CREATE, input),
    updateCustomField: (id: number, input: Partial<CreateCustomFieldInput>) =>
      ipcRenderer.invoke(IPC_CHANNELS.CUSTOM_FIELDS_UPDATE, id, input),
    deleteCustomField: (id: number) =>
      ipcRenderer.invoke(IPC_CHANNELS.CUSTOM_FIELDS_DELETE, id),
  },

  // ==================== Service Codes ====================
  codes: {
    getByClient: (clientId: number) =>
      ipcRenderer.invoke(IPC_CHANNELS.CODES_GET_BY_CLIENT, clientId),
    create: (input: CreateServiceCodeInput) =>
      ipcRenderer.invoke(IPC_CHANNELS.CODES_CREATE, input),
    update: (input: UpdateServiceCodeInput) =>
      ipcRenderer.invoke(IPC_CHANNELS.CODES_UPDATE, input),
    delete: (id: number) =>
      ipcRenderer.invoke(IPC_CHANNELS.CODES_DELETE, id),
  },

  // ==================== Glovo Riders (Independent) ====================
  glovo: {
    getAll: (params: PaginationParams) =>
      ipcRenderer.invoke(IPC_CHANNELS.GLOVO_RIDER_GET_ALL, params),
    getById: (id: number) =>
      ipcRenderer.invoke(IPC_CHANNELS.GLOVO_RIDER_GET_BY_ID, id),
    create: (input: CreateGlovoRiderInput) =>
      ipcRenderer.invoke(IPC_CHANNELS.GLOVO_RIDER_CREATE, input),
    update: (input: UpdateGlovoRiderInput) =>
      ipcRenderer.invoke(IPC_CHANNELS.GLOVO_RIDER_UPDATE, input),
    delete: (id: number) =>
      ipcRenderer.invoke(IPC_CHANNELS.GLOVO_RIDER_DELETE, id),
  },

  // ==================== Search ====================
  search: {
    global: (query: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.SEARCH_GLOBAL, query),
  },

  // ==================== Dashboard ====================
  dashboard: {
    getStats: () =>
      ipcRenderer.invoke(IPC_CHANNELS.DASHBOARD_STATS),
  },

  // ==================== Activity Log ====================
  activity: {
    getAll: (params: PaginationParams) =>
      ipcRenderer.invoke(IPC_CHANNELS.ACTIVITY_GET_ALL, params),
  },

  // ==================== Backup & Export ====================
  backup: {
    create: () => ipcRenderer.invoke(IPC_CHANNELS.BACKUP_CREATE),
    restore: () => ipcRenderer.invoke(IPC_CHANNELS.BACKUP_RESTORE),
    exportExcel: () => ipcRenderer.invoke(IPC_CHANNELS.EXPORT_EXCEL),
    exportCSV: () => ipcRenderer.invoke(IPC_CHANNELS.EXPORT_CSV),
    exportPDF: () => ipcRenderer.invoke(IPC_CHANNELS.EXPORT_PDF),
  },

  // ==================== Settings ====================
  settings: {
    getDbPath: () => ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_GET_DB_PATH),
  },

  // ==================== Print ====================
  print: {
    openHtml: (htmlContent: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.PRINT_HTML, htmlContent),
  },

  // ==================== Auto Update ====================
  updater: {
    getStatus: (): Promise<UpdateStatus> =>
      ipcRenderer.invoke(IPC_CHANNELS.UPDATER_GET_STATUS),
    check: (): Promise<UpdateStatus> =>
      ipcRenderer.invoke(IPC_CHANNELS.UPDATER_CHECK),
    install: (): Promise<UpdateStatus> =>
      ipcRenderer.invoke(IPC_CHANNELS.UPDATER_INSTALL),
    /** Subscribes to status changes; returns an unsubscribe function. */
    onStatus: (callback: (status: UpdateStatus) => void) => {
      const listener = (_event: Electron.IpcRendererEvent, status: UpdateStatus) => callback(status);
      ipcRenderer.on(IPC_CHANNELS.UPDATER_STATUS_EVENT, listener);
      return () => { ipcRenderer.removeListener(IPC_CHANNELS.UPDATER_STATUS_EVENT, listener); };
    },
  },
};

// Expose the API to the renderer process securely
contextBridge.exposeInMainWorld('api', api);

// Type declaration for the renderer
export type ElectronAPI = typeof api;
