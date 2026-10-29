// ============================================================
// Client Service — Business logic for client operations
// ============================================================
import { clientRepository } from '../repositories/client.repo';
import { activityLogRepository } from '../repositories/activity-log.repo';
import { validateClientInput } from '../utils/validation';
import type { Client, CreateClientInput, UpdateClientInput, PaginationParams, PaginatedResult, ApiResponse } from '../../shared/types';

export class ClientService {
  /**
   * Get paginated list of clients.
   */
  getAll(params: PaginationParams): ApiResponse<PaginatedResult<Client>> {
    try {
      const result = clientRepository.getAll(params);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Get a client by ID.
   */
  getById(id: number): ApiResponse<Client> {
    try {
      const client = clientRepository.getById(id);
      if (!client) {
        return { success: false, error: 'Client not found.' };
      }
      return { success: true, data: client };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Create a new client with validation.
   */
  create(input: CreateClientInput): ApiResponse<Client> {
    try {
      const errors = validateClientInput(input);
      if (errors.length > 0) {
        return { success: false, error: errors.map(e => e.message).join(' ') };
      }

      const client = clientRepository.create(input);

      // Log activity
      activityLogRepository.log(
        'CREATE_CLIENT',
        'client',
        client.id,
        `Created client: ${client.full_name}`
      );

      return { success: true, data: client, message: 'Client created successfully.' };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Update an existing client with validation.
   */
  update(input: UpdateClientInput): ApiResponse<Client> {
    try {
      const errors = validateClientInput(input);
      if (errors.length > 0) {
        return { success: false, error: errors.map(e => e.message).join(' ') };
      }

      const existing = clientRepository.getById(input.id);
      if (!existing) {
        return { success: false, error: 'Client not found.' };
      }

      const client = clientRepository.update(input);

      activityLogRepository.log(
        'UPDATE_CLIENT',
        'client',
        client.id,
        `Updated client: ${client.full_name}`
      );

      return { success: true, data: client, message: 'Client updated successfully.' };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Delete a client (cascades to service codes and Glovo accounts).
   */
  delete(id: number): ApiResponse<void> {
    try {
      const existing = clientRepository.getById(id);
      if (!existing) {
        return { success: false, error: 'Client not found.' };
      }

      const deleted = clientRepository.delete(id);
      if (!deleted) {
        return { success: false, error: 'Failed to delete client.' };
      }

      activityLogRepository.log(
        'DELETE_CLIENT',
        'client',
        id,
        `Deleted client: ${existing.full_name}`
      );

      return { success: true, message: 'Client deleted successfully.' };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
}

export const clientService = new ClientService();
