// ============================================================
// Services IPC Handler — Updated for Custom Fields Support
// ============================================================
import { ipcMain } from 'electron';
import { serviceRepository } from '../repositories/service.repo';
import { activityLogRepository } from '../repositories/activity-log.repo';
import { validateServiceInput } from '../utils/validation';
import { IPC_CHANNELS } from '../../shared/types';
import type {
  CreateServiceCategoryInput,
  CreateServiceSubcategoryInput,
  CreateCustomFieldInput,
  ApiResponse,
  ServiceCategory,
  ServiceSubcategory,
  CustomField
} from '../../shared/types';

export function registerServiceIpc(): void {
  // ==================== CATEGORIES ====================
  ipcMain.handle(IPC_CHANNELS.SERVICES_GET_ALL, (_event, activeOnly?: boolean) => {
    try {
      const categories = serviceRepository.getAllCategories(activeOnly);
      return { success: true, data: categories };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.SERVICES_CREATE, (_event, input: CreateServiceCategoryInput): ApiResponse<ServiceCategory> => {
    try {
      const errors = validateServiceInput(input);
      if (errors.length > 0) {
        return { success: false, error: errors.map(e => e.message).join(' ') };
      }

      const existing = serviceRepository.getCategoryByName(input.name);
      if (existing) {
        return { success: false, error: 'A service with this name already exists.' };
      }

      const category = serviceRepository.createCategory(input);
      activityLogRepository.log('CREATE_SERVICE_CATEGORY', 'service_category', category.id, `Created category: ${category.name}`);
      return { success: true, data: category, message: 'Category created successfully.' };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.SERVICES_UPDATE, (_event, id: number, input: Partial<CreateServiceCategoryInput>): ApiResponse<ServiceCategory> => {
    try {
      const category = serviceRepository.updateCategory(id, input);
      activityLogRepository.log('UPDATE_SERVICE_CATEGORY', 'service_category', id, `Updated category: ${category.name}`);
      return { success: true, data: category, message: 'Category updated successfully.' };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.SERVICES_TOGGLE, (_event, id: number): ApiResponse<ServiceCategory> => {
    try {
      const category = serviceRepository.toggleCategory(id);
      return { success: true, data: category };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.SERVICES_DELETE, (_event, id: number): ApiResponse<void> => {
    try {
      const category = serviceRepository.getCategoryById(id);
      if (!category) return { success: false, error: 'Category not found' };

      serviceRepository.deleteCategory(id);
      activityLogRepository.log('DELETE_SERVICE_CATEGORY', 'service_category', id, `Deleted category: ${category.name}`);
      return { success: true, message: 'Category deleted successfully.' };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // ==================== SUBCATEGORIES ====================
  ipcMain.handle(IPC_CHANNELS.SUBCATEGORIES_GET_ALL, (_event, categoryId?: number) => {
    try {
      const subcategories = serviceRepository.getSubcategories(categoryId);
      return { success: true, data: subcategories };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.SUBCATEGORIES_CREATE, (_event, input: CreateServiceSubcategoryInput): ApiResponse<ServiceSubcategory> => {
    try {
      if (!input.name || input.name.trim().length === 0) {
        return { success: false, error: 'Subcategory name is required.' };
      }

      const existing = serviceRepository.getSubcategoryByName(input.category_id, input.name);
      if (existing) {
        return { success: false, error: 'A subcategory with this name already exists under this category.' };
      }

      const subcategory = serviceRepository.createSubcategory(input);
      activityLogRepository.log('CREATE_SERVICE_SUBCATEGORY', 'service_subcategory', subcategory.id, `Created subcategory: ${subcategory.name}`);
      return { success: true, data: subcategory, message: 'Subcategory created successfully.' };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.SUBCATEGORIES_DELETE, (_event, id: number): ApiResponse<void> => {
    try {
      const sub = serviceRepository.getSubcategoryById(id);
      if (!sub) return { success: false, error: 'Subcategory not found' };

      serviceRepository.deleteSubcategory(id);
      activityLogRepository.log('DELETE_SERVICE_SUBCATEGORY', 'service_subcategory', id, `Deleted subcategory: ${sub.name}`);
      return { success: true, message: 'Subcategory deleted successfully.' };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  // ==================== CUSTOM FIELDS ====================
  ipcMain.handle(IPC_CHANNELS.CUSTOM_FIELDS_GET_BY_CATEGORY, (_event, categoryId: number) => {
    try {
      const fields = serviceRepository.getCustomFieldsByCategoryId(categoryId);
      return { success: true, data: fields };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.CUSTOM_FIELDS_CREATE, (_event, input: CreateCustomFieldInput): ApiResponse<CustomField> => {
    try {
      if (!input.label || input.label.trim().length === 0) {
        return { success: false, error: 'Field label is required.' };
      }

      const field = serviceRepository.createCustomField(input);
      activityLogRepository.log('CREATE_CUSTOM_FIELD', 'custom_field', field.id, `Created field: ${field.label} (${field.type}) for category #${field.category_id}`);
      return { success: true, data: field, message: 'Custom field created successfully.' };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.CUSTOM_FIELDS_UPDATE, (_event, id: number, input: Partial<CreateCustomFieldInput>): ApiResponse<CustomField> => {
    try {
      if (input.label !== undefined && input.label.trim().length === 0) {
        return { success: false, error: 'Field label cannot be empty.' };
      }
      const field = serviceRepository.updateCustomField(id, input);
      return { success: true, data: field, message: 'Custom field updated successfully.' };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle(IPC_CHANNELS.CUSTOM_FIELDS_DELETE, (_event, id: number): ApiResponse<void> => {
    try {
      const field = serviceRepository.getCustomFieldById(id);
      if (!field) return { success: false, error: 'Custom field not found' };

      serviceRepository.deleteCustomField(id);
      activityLogRepository.log('DELETE_CUSTOM_FIELD', 'custom_field', id, `Deleted custom field: ${field.label}`);
      return { success: true, message: 'Custom field deleted successfully.' };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });
}
