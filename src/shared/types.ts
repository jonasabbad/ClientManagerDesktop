// ============================================================
// Shared Types — Updated with Categories, Subcategories, Custom Fields & decoupled Glovo
// ============================================================

// ---------------------- Client ----------------------
export interface Client {
  id: number;
  full_name: string;
  phone: string;
  cin: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface CreateClientInput {
  full_name: string;
  phone?: string;
  cin?: string;
  notes?: string;
}

export interface UpdateClientInput extends CreateClientInput {
  id: number;
}

// ---------------------- Service Categories & Subcategories ----------------------
export interface ServiceCategory {
  id: number;
  name: string;
  icon: string | null;
  color: string | null;
  is_active: number;
  created_at: string;
}

export interface CreateServiceCategoryInput {
  name: string;
  icon?: string;
  color?: string;
}

export interface ServiceSubcategory {
  id: number;
  category_id: number;
  name: string;
  created_at: string;
  // Join field
  category_name?: string;
}

export interface CreateServiceSubcategoryInput {
  category_id: number;
  name: string;
}

// ---------------------- Custom Fields (Dynamic) ----------------------
export type CustomFieldType = 'text' | 'number' | 'date' | 'phone' | 'email' | 'textarea';

export interface CustomField {
  id: number;
  category_id: number;
  label: string;
  type: CustomFieldType;
  required: number; // 1 = true, 0 = false
  placeholder: string;
  display_order: number;
}

export interface CreateCustomFieldInput {
  category_id: number;
  label: string;
  type: CustomFieldType;
  required?: number;
  placeholder?: string;
  display_order?: number;
}

export interface UpdateCustomFieldInput {
  id: number;
  label?: string;
  type?: CustomFieldType;
  required?: number;
  placeholder?: string;
  display_order?: number;
}

export interface ServiceCodeCustomValue {
  id: number;
  service_code_id: number;
  field_id: number;
  value: string;
  // Joined properties
  label?: string;
  type?: CustomFieldType;
  required?: number;
}

// ---------------------- Service Code ----------------------
export interface ServiceCode {
  id: number;
  client_id: number;
  subcategory_id: number;
  code: string;
  label: string;
  notes: string;
  created_at: string;
  // Joined fields
  subcategory_name?: string;
  category_name?: string;
  category_color?: string;
  client_name?: string;
  // Custom Values
  customValues?: ServiceCodeCustomValue[];
}

export interface CreateServiceCodeInput {
  client_id: number;
  subcategory_id?: number;
  category_id?: number;
  code: string;
  label?: string;
  notes?: string;
  customValues?: Array<{ field_id: number; value: string }>;
}

export interface UpdateServiceCodeInput {
  id: number;
  subcategory_id?: number;
  category_id?: number;
  code?: string;
  label?: string;
  notes?: string;
  customValues?: Array<{ field_id: number; value: string }>;
}

// ---------------------- Glovo Riders (Decoupled) ----------------------
export interface GlovoRider {
  id: number;
  rider_name: string;
  rider_id: string;
  phone: string;
  email: string;
  city: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface CreateGlovoRiderInput {
  rider_name: string;
  rider_id: string;
  phone?: string;
  email?: string;
  city?: string;
  notes?: string;
}

export interface UpdateGlovoRiderInput extends CreateGlovoRiderInput {
  id: number;
}

// ---------------------- Activity Log ----------------------
export type ActionType =
  | 'CREATE_CLIENT'
  | 'UPDATE_CLIENT'
  | 'DELETE_CLIENT'
  | 'CREATE_CODE'
  | 'UPDATE_CODE'
  | 'DELETE_CODE'
  | 'CREATE_GLOVO_RIDER'
  | 'UPDATE_GLOVO_RIDER'
  | 'DELETE_GLOVO_RIDER'
  | 'BACKUP'
  | 'RESTORE'
  | 'EXPORT'
  | 'CREATE_SERVICE_CATEGORY'
  | 'UPDATE_SERVICE_CATEGORY'
  | 'DELETE_SERVICE_CATEGORY'
  | 'CREATE_SERVICE_SUBCATEGORY'
  | 'DELETE_SERVICE_SUBCATEGORY'
  | 'CREATE_CUSTOM_FIELD'
  | 'DELETE_CUSTOM_FIELD';

export interface ActivityLog {
  id: number;
  action: ActionType;
  entity_type: string;
  entity_id: number | null;
  details: string;
  created_at: string;
}

// ---------------------- Dashboard ----------------------
export interface DashboardStats {
  totalClients: number;
  totalCodes: number;
  todayNewClients: number;
  totalGlovoRiders: number;
  codesPerService: Array<{ service_name: string; count: number }>;
  latestClients: Client[];
  recentActivity: ActivityLog[];
}

// ---------------------- Search ----------------------
export interface SearchResult {
  type: 'client' | 'service_code' | 'glovo';
  id: number;
  client_id?: number;
  client_name?: string;
  match_field: string;
  match_value: string;
}

// ---------------------- Pagination ----------------------
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// ---------------------- API Response ----------------------
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ---------------------- Auto Update ----------------------
export type UpdateState =
  | 'disabled'       // Not a packaged/installed build (dev mode)
  | 'idle'
  | 'checking'
  | 'available'
  | 'not-available'
  | 'downloading'
  | 'downloaded'
  | 'error';

export interface UpdateStatus {
  state: UpdateState;
  currentVersion: string;
  /** Version offered by the latest GitHub Release. */
  version?: string;
  /** Download progress, 0–100. */
  percent?: number;
  /** 'offline' lets the UI show a friendlier message than the raw error. */
  errorKind?: 'offline' | 'other';
  error?: string;
  /** True while the install waits for a critical database operation. */
  waitingForDb?: boolean;
  /** True when the user asked for this check (vs. the automatic startup one). */
  manual?: boolean;
}

// ---------------------- IPC Channels ----------------------
export const IPC_CHANNELS = {
  // Clients
  CLIENTS_GET_ALL: 'clients:getAll',
  CLIENTS_GET_BY_ID: 'clients:getById',
  CLIENTS_CREATE: 'clients:create',
  CLIENTS_UPDATE: 'clients:update',
  CLIENTS_DELETE: 'clients:delete',

  // Service Categories & Subcategories
  SERVICES_GET_ALL: 'services:getAll',
  SERVICES_CREATE: 'services:create',
  SERVICES_UPDATE: 'services:update',
  SERVICES_TOGGLE: 'services:toggle',
  SERVICES_DELETE: 'services:delete',
  
  SUBCATEGORIES_GET_ALL: 'subcategories:getAll',
  SUBCATEGORIES_CREATE: 'subcategories:create',
  SUBCATEGORIES_DELETE: 'subcategories:delete',

  // Custom Fields
  CUSTOM_FIELDS_GET_BY_CATEGORY: 'customFields:getByCategory',
  CUSTOM_FIELDS_CREATE: 'customFields:create',
  CUSTOM_FIELDS_UPDATE: 'customFields:update',
  CUSTOM_FIELDS_DELETE: 'customFields:delete',

  // Service Codes
  CODES_GET_BY_CLIENT: 'codes:getByClient',
  CODES_CREATE: 'codes:create',
  CODES_UPDATE: 'codes:update',
  CODES_DELETE: 'codes:delete',

  // Glovo Riders (Independent)
  GLOVO_RIDER_GET_ALL: 'glovo:getAll',
  GLOVO_RIDER_GET_BY_ID: 'glovo:getById',
  GLOVO_RIDER_CREATE: 'glovo:create',
  GLOVO_RIDER_UPDATE: 'glovo:update',
  GLOVO_RIDER_DELETE: 'glovo:delete',

  // Search
  SEARCH_GLOBAL: 'search:global',

  // Dashboard
  DASHBOARD_STATS: 'dashboard:stats',

  // Activity Log
  ACTIVITY_GET_ALL: 'activity:getAll',

  // Backup & Export
  BACKUP_CREATE: 'backup:create',
  BACKUP_RESTORE: 'backup:restore',
  EXPORT_EXCEL: 'export:excel',
  EXPORT_CSV: 'export:csv',
  EXPORT_PDF: 'export:pdf',

  // Settings
  SETTINGS_GET_DB_PATH: 'settings:getDbPath',

  // Print
  PRINT_HTML: 'print:html',

  // Auto Update
  UPDATER_GET_STATUS: 'updater:getStatus',
  UPDATER_CHECK: 'updater:check',
  UPDATER_INSTALL: 'updater:install',
  UPDATER_STATUS_EVENT: 'updater:status',
} as const;
