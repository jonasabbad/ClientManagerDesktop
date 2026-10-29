// ============================================================
// Glovo Riders Service — Decoupled independent module
// ============================================================
import { glovoRepository } from '../repositories/glovo.repo';
import { activityLogRepository } from '../repositories/activity-log.repo';
import { validateGlovoInput } from '../utils/validation';
import type { GlovoRider, CreateGlovoRiderInput, UpdateGlovoRiderInput, PaginationParams, PaginatedResult, ApiResponse } from '../../shared/types';

export class GlovoService {
  /**
   * Get all Glovo riders with pagination and search.
   */
  getAll(params: PaginationParams): ApiResponse<PaginatedResult<GlovoRider>> {
    try {
      const result = glovoRepository.getAll(params);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Get a rider by ID.
   */
  getById(id: number): ApiResponse<GlovoRider> {
    try {
      const rider = glovoRepository.getById(id);
      if (!rider) {
        return { success: false, error: 'Glovo rider not found.' };
      }
      return { success: true, data: rider };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Create a new Rider with Unique Rider ID validation.
   */
  create(input: CreateGlovoRiderInput): ApiResponse<GlovoRider> {
    try {
      const errors = validateGlovoInput(input);
      if (errors.length > 0) {
        return { success: false, error: errors.map(e => e.message).join(' ') };
      }

      // Check unique Rider ID
      const existing = glovoRepository.findByRiderId(input.rider_id);
      if (existing) {
        return {
          success: false,
          error: `This Glovo ID already belongs to rider: ${existing.rider_name}`,
        };
      }

      const rider = glovoRepository.create(input);

      activityLogRepository.log(
        'CREATE_GLOVO_RIDER',
        'glovo_rider',
        rider.id,
        `Created Glovo rider: ${rider.rider_name} (ID: ${rider.rider_id})`
      );

      return { success: true, data: rider, message: 'Glovo rider created successfully.' };
    } catch (error) {
      const msg = (error as Error).message;
      if (msg.includes('UNIQUE constraint')) {
        return { success: false, error: 'This Glovo Rider ID already exists.' };
      }
      return { success: false, error: msg };
    }
  }

  /**
   * Update an existing Rider.
   */
  update(input: UpdateGlovoRiderInput): ApiResponse<GlovoRider> {
    try {
      const errors = validateGlovoInput(input);
      if (errors.length > 0) {
        return { success: false, error: errors.map(e => e.message).join(' ') };
      }

      const existing = glovoRepository.findByRiderId(input.rider_id);
      if (existing && existing.id !== input.id) {
        return {
          success: false,
          error: `This Glovo ID already belongs to rider: ${existing.rider_name}`,
        };
      }

      const rider = glovoRepository.update(input);

      activityLogRepository.log(
        'UPDATE_GLOVO_RIDER',
        'glovo_rider',
        rider.id,
        `Updated Glovo rider: ${rider.rider_name} (ID: ${rider.rider_id})`
      );

      return { success: true, data: rider, message: 'Glovo rider updated successfully.' };
    } catch (error) {
      const msg = (error as Error).message;
      if (msg.includes('UNIQUE constraint')) {
        return { success: false, error: 'This Glovo Rider ID already exists.' };
      }
      return { success: false, error: msg };
    }
  }

  /**
   * Delete a Rider.
   */
  delete(id: number): ApiResponse<void> {
    try {
      const existing = glovoRepository.getById(id);
      if (!existing) {
        return { success: false, error: 'Glovo rider not found.' };
      }

      glovoRepository.delete(id);

      activityLogRepository.log(
        'DELETE_GLOVO_RIDER',
        'glovo_rider',
        id,
        `Deleted Glovo rider: ${existing.rider_name} (ID: ${existing.rider_id})`
      );

      return { success: true, message: 'Glovo rider deleted successfully.' };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
}

export const glovoService = new GlovoService();
