// ============================================================
// Service Code Service — Updated with dynamic required validation
// ============================================================
import { serviceCodeRepository } from '../repositories/service-code.repo';
import { serviceRepository } from '../repositories/service.repo';
import { activityLogRepository } from '../repositories/activity-log.repo';
import { validateServiceCodeInput } from '../utils/validation';
import type { ServiceCode, CreateServiceCodeInput, UpdateServiceCodeInput, ApiResponse } from '../../shared/types';

export class ServiceCodeService {
  /**
   * Get service codes for a specific client.
   */
  getByClientId(clientId: number): ApiResponse<ServiceCode[]> {
    try {
      const codes = serviceCodeRepository.getByClientId(clientId);
      return { success: true, data: codes };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Validate custom fields for a category.
   */
  private validateCustomValues(categoryId: number, customValues?: Array<{ field_id: number; value: string }>): string | null {
    const fields = serviceRepository.getCustomFieldsByCategoryId(categoryId);
    const valueMap = new Map(customValues?.map(item => [item.field_id, item.value]) || []);

    for (const field of fields) {
      if (field.required === 1) {
        const val = valueMap.get(field.id);
        if (!val || val.trim().length === 0) {
          return `Le champ "${field.label}" est obligatoire.`;
        }
      }
    }
    return null;
  }

  /**
   * Create a new service code with unique checking and dynamic custom field validation.
   */
  create(input: CreateServiceCodeInput): ApiResponse<ServiceCode> {
    try {
      // Auto-resolve or create subcategory if missing
      if (!input.subcategory_id && input.category_id) {
        const subs = serviceRepository.getSubcategories(input.category_id);
        if (subs.length === 0) {
          const cat = serviceRepository.getCategoryById(input.category_id);
          const defaultSubName = cat ? cat.name : 'Général';
          const newSub = serviceRepository.createSubcategory({
            category_id: input.category_id,
            name: defaultSubName,
          });
          input.subcategory_id = newSub.id;
        } else {
          input.subcategory_id = subs[0].id;
        }
      }

      // 1. Basic validation
      const errors = validateServiceCodeInput(input as any);
      if (errors.length > 0) {
        return { success: false, error: errors.map(e => e.message).join(' ') };
      }

      // 2. Fetch parent category to validate custom values
      const sub = serviceRepository.getSubcategoryById(input.subcategory_id!);
      if (!sub) {
        return { success: false, error: 'Subcategory not found.' };
      }

      // 3. Dynamic Custom fields validation
      const validationError = this.validateCustomValues(sub.category_id, input.customValues);
      if (validationError) {
        return { success: false, error: validationError };
      }

      // 4. Duplicate service code checking
      const existing = serviceCodeRepository.findByCode(input.code.trim());
      if (existing) {
        return {
          success: false,
          error: `This code already belongs to another client: ${existing.client_name}`,
        };
      }

      const code = serviceCodeRepository.create(input as any);

      activityLogRepository.log(
        'CREATE_CODE',
        'service_code',
        code.id,
        `Added code "${code.code}" (${code.category_name} -> ${code.subcategory_name})`
      );

      return { success: true, data: code, message: 'Service code added successfully.' };
    } catch (error) {
      const msg = (error as Error).message;
      if (msg.includes('UNIQUE constraint')) {
        return { success: false, error: 'This code already belongs to another client.' };
      }
      return { success: false, error: msg };
    }
  }

  /**
   * Update an existing service code.
   */
  update(input: UpdateServiceCodeInput): ApiResponse<ServiceCode> {
    try {
      // Auto-resolve or create subcategory if missing
      if (!input.subcategory_id && input.category_id) {
        const subs = serviceRepository.getSubcategories(input.category_id);
        if (subs.length === 0) {
          const cat = serviceRepository.getCategoryById(input.category_id);
          const defaultSubName = cat ? cat.name : 'Général';
          const newSub = serviceRepository.createSubcategory({
            category_id: input.category_id,
            name: defaultSubName,
          });
          input.subcategory_id = newSub.id;
        } else {
          input.subcategory_id = subs[0].id;
        }
      }

      if (input.code) {
        const existing = serviceCodeRepository.findByCode(input.code.trim());
        if (existing && existing.id !== input.id) {
          return {
            success: false,
            error: `This code already belongs to another client: ${existing.client_name}`,
          };
        }
      }

      // Find subcategory to validate custom values
      const currentCode = serviceCodeRepository.getById(input.id);
      if (!currentCode) {
        return { success: false, error: 'Service code not found.' };
      }

      const targetSubId = input.subcategory_id ?? currentCode.subcategory_id;
      const sub = serviceRepository.getSubcategoryById(targetSubId);
      if (!sub) {
        return { success: false, error: 'Subcategory not found.' };
      }

      // Dynamic Custom fields validation
      if (input.customValues) {
        const validationError = this.validateCustomValues(sub.category_id, input.customValues);
        if (validationError) {
          return { success: false, error: validationError };
        }
      }

      const code = serviceCodeRepository.update(input);

      activityLogRepository.log(
        'UPDATE_CODE',
        'service_code',
        code.id,
        `Updated code "${code.code}" (${code.category_name} -> ${code.subcategory_name})`
      );

      return { success: true, data: code, message: 'Service code updated successfully.' };
    } catch (error) {
      const msg = (error as Error).message;
      if (msg.includes('UNIQUE constraint')) {
        return { success: false, error: 'This code already belongs to another client.' };
      }
      return { success: false, error: msg };
    }
  }

  /**
   * Delete a service code.
   */
  delete(id: number): ApiResponse<void> {
    try {
      const existing = serviceCodeRepository.getById(id);
      if (!existing) {
        return { success: false, error: 'Service code not found.' };
      }

      serviceCodeRepository.delete(id);

      activityLogRepository.log(
        'DELETE_CODE',
        'service_code',
        id,
        `Deleted code "${existing.code}" (${existing.category_name} -> ${existing.subcategory_name})`
      );

      return { success: true, message: 'Service code deleted successfully.' };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
}

export const serviceCodeService = new ServiceCodeService();
