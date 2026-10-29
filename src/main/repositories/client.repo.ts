// ============================================================
// Client Repository — Data access layer for clients table
// ============================================================
import { getDatabase } from '../database/connection';
import type { Client, CreateClientInput, UpdateClientInput, PaginationParams, PaginatedResult } from '../../shared/types';

export class ClientRepository {
  /**
   * Get all clients with pagination and optional search.
   */
  getAll(params: PaginationParams): PaginatedResult<Client> {
    const db = getDatabase();
    const { page, limit, search, sortBy = 'created_at', sortOrder = 'DESC' } = params;
    const offset = (page - 1) * limit;

    // Whitelist sort columns to prevent injection
    const allowedSorts = ['id', 'full_name', 'phone', 'created_at', 'updated_at'];
    const safeSort = allowedSorts.includes(sortBy) ? sortBy : 'created_at';
    const safeOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';

    let whereClause = '';
    const queryParams: unknown[] = [];

    if (search) {
      whereClause = 'WHERE full_name LIKE ? OR phone LIKE ? OR cin LIKE ?';
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    const total = db.prepare(
      `SELECT COUNT(*) as count FROM clients ${whereClause}`
    ).get(...queryParams) as { count: number };

    const data = db.prepare(
      `SELECT * FROM clients ${whereClause} ORDER BY ${safeSort} ${safeOrder} LIMIT ? OFFSET ?`
    ).all(...queryParams, limit, offset) as Client[];

    return {
      data,
      total: total.count,
      page,
      limit,
      totalPages: Math.ceil(total.count / limit),
    };
  }

  /**
   * Get a single client by ID.
   */
  getById(id: number): Client | undefined {
    const db = getDatabase();
    return db.prepare('SELECT * FROM clients WHERE id = ?').get(id) as Client | undefined;
  }

  /**
   * Create a new client. Returns the created client.
   */
  create(input: CreateClientInput): Client {
    const db = getDatabase();
    const result = db.prepare(
      `INSERT INTO clients (full_name, phone, cin, notes)
       VALUES (?, ?, ?, ?)`
    ).run(
      input.full_name.trim(),
      input.phone?.trim() || '',
      input.cin?.trim() || '',
      input.notes?.trim() || ''
    );

    return this.getById(Number(result.lastInsertRowid))!;
  }

  /**
   * Update an existing client. Returns the updated client.
   */
  update(input: UpdateClientInput): Client {
    const db = getDatabase();
    db.prepare(
      `UPDATE clients SET
        full_name = ?,
        phone = ?,
        cin = ?,
        notes = ?,
        updated_at = datetime('now')
       WHERE id = ?`
    ).run(
      input.full_name.trim(),
      input.phone?.trim() || '',
      input.cin?.trim() || '',
      input.notes?.trim() || '',
      input.id
    );

    return this.getById(input.id)!;
  }

  /**
   * Delete a client and all related records (CASCADE).
   */
  delete(id: number): boolean {
    const db = getDatabase();
    const result = db.prepare('DELETE FROM clients WHERE id = ?').run(id);
    return result.changes > 0;
  }

  /**
   * Get total client count.
   */
  count(): number {
    const db = getDatabase();
    const result = db.prepare('SELECT COUNT(*) as count FROM clients').get() as { count: number };
    return result.count;
  }

  /**
   * Get clients created today.
   */
  getTodayCount(): number {
    const db = getDatabase();
    const result = db.prepare(
      "SELECT COUNT(*) as count FROM clients WHERE date(created_at) = date('now')"
    ).get() as { count: number };
    return result.count;
  }

  /**
   * Get the most recent clients.
   */
  getLatest(limit: number = 10): Client[] {
    const db = getDatabase();
    return db.prepare(
      'SELECT * FROM clients ORDER BY created_at DESC LIMIT ?'
    ).all(limit) as Client[];
  }
}

export const clientRepository = new ClientRepository();
