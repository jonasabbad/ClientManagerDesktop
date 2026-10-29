// ============================================================
// Search Repository — Updated for categories and independent Glovo
// ============================================================
import { getDatabase } from '../database/connection';
import type { SearchResult } from '../../shared/types';

export class SearchRepository {
  /**
   * Performs a global search across clients, service codes, and independent Glovo riders.
   */
  globalSearch(query: string, limit: number = 50): SearchResult[] {
    const db = getDatabase();

    if (!query || query.trim().length === 0) return [];

    const searchTerm = `%${query.trim()}%`;
    const results: SearchResult[] = [];

    // 1. Search clients by name
    const clientsByName = db.prepare(`
      SELECT id, full_name, 'client' as type
      FROM clients
      WHERE full_name LIKE ?
      LIMIT ?
    `).all(searchTerm, limit) as Array<{ id: number; full_name: string; type: string }>;

    for (const c of clientsByName) {
      results.push({
        type: 'client',
        id: c.id,
        client_id: c.id,
        client_name: c.full_name,
        match_field: 'name',
        match_value: c.full_name,
      });
    }

    // 2. Search clients by phone
    const clientsByPhone = db.prepare(`
      SELECT id, full_name, phone
      FROM clients
      WHERE phone LIKE ? AND phone != ''
      LIMIT ?
    `).all(searchTerm, limit) as Array<{ id: number; full_name: string; phone: string }>;

    for (const c of clientsByPhone) {
      results.push({
        type: 'client',
        id: c.id,
        client_id: c.id,
        client_name: c.full_name,
        match_field: 'phone',
        match_value: c.phone,
      });
    }

    // 3. Search service codes
    const codes = db.prepare(`
      SELECT sc.id, sc.client_id, sc.code, c.full_name as client_name
      FROM service_codes sc
      JOIN clients c ON sc.client_id = c.id
      WHERE sc.code LIKE ?
      LIMIT ?
    `).all(searchTerm, limit) as Array<{
      id: number; client_id: number; code: string; client_name: string;
    }>;

    for (const sc of codes) {
      results.push({
        type: 'service_code',
        id: sc.id,
        client_id: sc.client_id,
        client_name: sc.client_name,
        match_field: 'code',
        match_value: sc.code,
      });
    }

    // 4. Search Glovo riders by rider_id
    const glovoById = db.prepare(`
      SELECT id, rider_name, rider_id
      FROM glovo_riders
      WHERE rider_id LIKE ?
      LIMIT ?
    `).all(searchTerm, limit) as Array<{
      id: number; rider_name: string; rider_id: string;
    }>;

    for (const g of glovoById) {
      results.push({
        type: 'glovo',
        id: g.id,
        client_name: g.rider_name,
        match_field: 'glovo_id',
        match_value: g.rider_id,
      });
    }

    // 5. Search Glovo riders by name
    const glovoByName = db.prepare(`
      SELECT id, rider_name, rider_id
      FROM glovo_riders
      WHERE rider_name LIKE ?
      LIMIT ?
    `).all(searchTerm, limit) as Array<{
      id: number; rider_name: string; rider_id: string;
    }>;

    for (const g of glovoByName) {
      if (!results.find(r => r.type === 'glovo' && r.id === g.id)) {
        results.push({
          type: 'glovo',
          id: g.id,
          client_name: g.rider_name,
          match_field: 'glovo_name',
          match_value: g.rider_name,
        });
      }
    }

    return results.slice(0, limit);
  }
}

export const searchRepository = new SearchRepository();
