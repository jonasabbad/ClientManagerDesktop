// ============================================================
// Glovo Riders Repository — Decoupled from clients
// ============================================================
import { getDatabase } from '../database/connection';
import type { GlovoRider, CreateGlovoRiderInput, UpdateGlovoRiderInput, PaginationParams, PaginatedResult } from '../../shared/types';

export class GlovoRepository {
  /**
   * Get a rider by ID.
   */
  getById(id: number): GlovoRider | undefined {
    const db = getDatabase();
    return db.prepare('SELECT * FROM glovo_riders WHERE id = ?').get(id) as GlovoRider | undefined;
  }

  /**
   * Find a rider by rider_id (for duplicate checking).
   */
  findByRiderId(riderId: string): GlovoRider | undefined {
    const db = getDatabase();
    return db.prepare('SELECT * FROM glovo_riders WHERE rider_id = ?').get(riderId.trim()) as GlovoRider | undefined;
  }

  /**
   * Get all Glovo riders with pagination and search.
   */
  getAll(params: PaginationParams): PaginatedResult<GlovoRider> {
    const db = getDatabase();
    const { page, limit, search } = params;
    const offset = (page - 1) * limit;

    let whereClause = '';
    const queryParams: unknown[] = [];

    if (search) {
      whereClause = 'WHERE rider_name LIKE ? OR rider_id LIKE ? OR phone LIKE ?';
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    const total = db.prepare(
      `SELECT COUNT(*) as count FROM glovo_riders ${whereClause}`
    ).get(...queryParams) as { count: number };

    const data = db.prepare(
      `SELECT * FROM glovo_riders ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`
    ).all(...queryParams, limit, offset) as GlovoRider[];

    return {
      data,
      total: total.count,
      page,
      limit,
      totalPages: Math.ceil(total.count / limit),
    };
  }

  /**
   * Create a new Rider. Enforces UNIQUE rider_id constraint.
   */
  create(input: CreateGlovoRiderInput): GlovoRider {
    const db = getDatabase();
    const result = db.prepare(
      `INSERT INTO glovo_riders (rider_name, rider_id, phone, email, city, notes)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(
      input.rider_name.trim(),
      input.rider_id.trim(),
      input.phone?.trim() || '',
      input.email?.trim() || '',
      input.city?.trim() || '',
      input.notes?.trim() || ''
    );

    return this.getById(Number(result.lastInsertRowid))!;
  }

  /**
   * Update an existing Rider.
   */
  update(input: UpdateGlovoRiderInput): GlovoRider {
    const db = getDatabase();
    const current = this.getById(input.id);
    if (!current) throw new Error('Glovo rider not found');

    db.prepare(
      `UPDATE glovo_riders SET
        rider_name = ?, rider_id = ?, phone = ?, email = ?, city = ?, notes = ?,
        updated_at = datetime('now')
       WHERE id = ?`
    ).run(
      input.rider_name.trim(),
      input.rider_id.trim(),
      input.phone?.trim() || '',
      input.email?.trim() || '',
      input.city?.trim() || '',
      input.notes?.trim() || '',
      input.id
    );

    return this.getById(input.id)!;
  }

  /**
   * Delete a Rider.
   */
  delete(id: number): boolean {
    const db = getDatabase();
    const result = db.prepare('DELETE FROM glovo_riders WHERE id = ?').run(id);
    return result.changes > 0;
  }

  /**
   * Get total rider count.
   */
  count(): number {
    const db = getDatabase();
    const result = db.prepare('SELECT COUNT(*) as count FROM glovo_riders').get() as { count: number };
    return result.count;
  }
}

export const glovoRepository = new GlovoRepository();

