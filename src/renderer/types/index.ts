// ============================================================
// Renderer Types — Re-export shared types + renderer-specific
// ============================================================
export type {
  Client,
  CreateClientInput,
  UpdateClientInput,
  ServiceCategory,
  CreateServiceCategoryInput,
  ServiceSubcategory,
  CreateServiceSubcategoryInput,
  CustomField,
  CreateCustomFieldInput,
  UpdateCustomFieldInput,
  CustomFieldType,
  ServiceCodeCustomValue,
  ServiceCode,
  CreateServiceCodeInput,
  UpdateServiceCodeInput,
  GlovoRider,
  CreateGlovoRiderInput,
  UpdateGlovoRiderInput,
  ActivityLog,
  ActionType,
  DashboardStats,
  SearchResult,
  PaginatedResult,
  PaginationParams,
  ApiResponse,
  UpdateStatus,
} from '../../shared/types';

// Notification state type for SnackbarNotification component
export interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}
