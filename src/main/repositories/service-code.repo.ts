// ============================================================
// Service Code Repository — Modified for Custom Values
// ============================================================
import { getDatabase } from '../database/connection';
import type { ServiceCode, CreateServiceCodeInput, UpdateServiceCodeInput, ServiceCodeCustomValue } from '../../shared/types';

export class ServiceCodeRepository {
  /**
   * Get custom field values saved for a specific service code.
   */
  getCustomValuesForCode(serviceCodeId: number): ServiceCodeCustomValue[] {
    const db = getDatabase();
    return db.prepare(`
      SELECT val.*, field.label, field.type, field.required
      FROM service_code_custom_values val
      JOIN custom_fields field ON val.field_id = field.id
      WHERE val.service_code_id = ?
      ORDER BY field.display_order ASC, field.label ASC
    `).all(serviceCodeId) as ServiceCodeCustomValue[];
  }

  /**
   * Get all service codes for a client with category, subcategory and custom values.
   */
  getByClientId(clientId: number): ServiceCode[] {
    const db = getDatabase();
    const codes = db.prepare(`
      SELECT sc.*, sub.name as subcategory_name, cat.name as category_name, cat.color as category_color
      FROM service_codes sc
      JOIN service_subcategories sub ON sc.subcategory_id = sub.id
      JOIN service_categories cat ON sub.category_id = cat.id
      WHERE sc.client_id = ?
      ORDER BY sc.created_at DESC
    `).all(clientId) as ServiceCode[];

    for (const code of codes) {
      code.customValues = this.getCustomValuesForCode(code.id);
    }

    return codes;
  }

  /**
   * Get a service code by ID with custom values.
   */
  getById(id: number): ServiceCode | undefined {
    const db = getDatabase();
    const code = db.prepare(`
      SELECT sc.*, sub.name as subcategory_name, cat.name as category_name, cat.color as category_color
      FROM service_codes sc
      JOIN service_subcategories sub ON sc.subcategory_id = sub.id
      JOIN service_categories cat ON sub.category_id = cat.id
      WHERE sc.id = ?
    `).get(id) as ServiceCode | undefined;

    if (code) {
      code.customValues = this.getCustomValuesForCode(code.id);
    }

    return code;
  }

  /**
   * Find a service code by its code value (for duplicate checking).
   */
  findByCode(code: string): ServiceCode | undefined {
    const db = getDatabase();
    const match = db.prepare(`
      SELECT sc.*, sub.name as subcategory_name, cat.name as category_name, c.full_name as client_name
      FROM service_codes sc
      JOIN service_subcategories sub ON sc.subcategory_id = sub.id
      JOIN service_categories cat ON sub.category_id = cat.id
      JOIN clients c ON sc.client_id = c.id
      WHERE sc.code = ?
    `).get(code) as ServiceCode | undefined;

    if (match) {
      match.customValues = this.getCustomValuesForCode(match.id);
    }

    return match;
  }

  /**
   * Create a new service code referencing a subcategory with custom values.
   */
  create(input: CreateServiceCodeInput): ServiceCode {
    const db = getDatabase();
    const insertCode = db.prepare(`
      INSERT INTO service_codes (client_id, subcategory_id, code, label, notes)
      VALUES (?, ?, ?, ?, ?)
    `);

    const insertValue = db.prepare(`
      INSERT INTO service_code_custom_values (service_code_id, field_id, value)
      VALUES (?, ?, ?)
    `);

    let codeId = 0;

    const transaction = db.transaction(() => {
      const result = insertCode.run(
        input.client_id,
        input.subcategory_id,
        input.code.trim(),
        input.label?.trim() || '',
        input.notes?.trim() || ''
      );
      codeId = Number(result.lastInsertRowid);

      if (input.customValues && input.customValues.length > 0) {
        for (const item of input.customValues) {
          insertValue.run(codeId, item.field_id, String(item.value || '').trim());
        }
      }
    });

    transaction();
    return this.getById(codeId)!;
  }

  /**
   * Update an existing service code and its custom values.
   */
  update(input: UpdateServiceCodeInput): ServiceCode {
    const db = getDatabase();
    const current = this.getById(input.id);
    if (!current) throw new Error('Service code not found');

    const updateCode = db.prepare(`
      UPDATE service_codes SET
        subcategory_id = ?,
        code = ?,
        label = ?,
        notes = ?
       WHERE id = ?`
    );

    const deleteValues = db.prepare(`
      DELETE FROM service_code_custom_values WHERE service_code_id = ?
    `);

    const insertValue = db.prepare(`
      INSERT INTO service_code_custom_values (service_code_id, field_id, value)
      VALUES (?, ?, ?)
    `);

    const transaction = db.transaction(() => {
      updateCode.run(
        input.subcategory_id ?? current.subcategory_id,
        input.code?.trim() ?? current.code,
        input.label?.trim() ?? current.label,
        input.notes?.trim() ?? current.notes,
        input.id
      );

      if (input.customValues) {
        deleteValues.run(input.id);
        for (const item of input.customValues) {
          insertValue.run(input.id, item.field_id, String(item.value || '').trim());
        }
      }
    });

    transaction();
    return this.getById(input.id)!;
  }

  /**
   * Delete a service code.
   */
  delete(id: number): boolean {
    const db = getDatabase();
    const result = db.prepare('DELETE FROM service_codes WHERE id = ?').run(id);
    return result.changes > 0;
  }

  /**
   * Count total service codes.
   */
  count(): number {
    const db = getDatabase();
    const result = db.prepare('SELECT COUNT(*) as count FROM service_codes').get() as { count: number };
    return result.count;
  }

  /**
   * Group codes per parent Category for stats.
   */
  countByCategory(): Array<{ service_name: string; count: number }> {
    const db = getDatabase();
    return db.prepare(`
      SELECT cat.name as service_name, COUNT(sc.id) as count
      FROM service_categories cat
      LEFT JOIN service_subcategories sub ON cat.id = sub.category_id
      LEFT JOIN service_codes sc ON sub.id = sc.subcategory_id
      WHERE cat.is_active = 1
      GROUP BY cat.id, cat.name
      ORDER BY count DESC
    `).all() as Array<{ service_name: string; count: number }>;
  }
}

export const serviceCodeRepository = new ServiceCodeRepository();
