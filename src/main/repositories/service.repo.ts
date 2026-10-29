// ============================================================
// Service Categories & Subcategories Repository
// ============================================================
import { getDatabase } from '../database/connection';
import type {
  ServiceCategory,
  CreateServiceCategoryInput,
  ServiceSubcategory,
  CreateServiceSubcategoryInput,
  CustomField,
  CreateCustomFieldInput
} from '../../shared/types';

export class ServiceRepository {
  // ==================== CATEGORY OPERATIONS ====================

  getAllCategories(activeOnly: boolean = false): ServiceCategory[] {
    const db = getDatabase();
    const query = activeOnly
      ? 'SELECT * FROM service_categories WHERE is_active = 1 ORDER BY name'
      : 'SELECT * FROM service_categories ORDER BY name';
    return db.prepare(query).all() as ServiceCategory[];
  }

  getCategoryById(id: number): ServiceCategory | undefined {
    const db = getDatabase();
    return db.prepare('SELECT * FROM service_categories WHERE id = ?').get(id) as ServiceCategory | undefined;
  }

  getCategoryByName(name: string): ServiceCategory | undefined {
    const db = getDatabase();
    return db.prepare('SELECT * FROM service_categories WHERE name = ?').get(name) as ServiceCategory | undefined;
  }

  createCategory(input: CreateServiceCategoryInput): ServiceCategory {
    const db = getDatabase();
    const result = db.prepare(
      'INSERT INTO service_categories (name, icon, color) VALUES (?, ?, ?)'
    ).run(
      input.name.trim(),
      input.icon || '',
      input.color || '#1976d2'
    );

    return this.getCategoryById(Number(result.lastInsertRowid))!;
  }

  updateCategory(id: number, input: Partial<CreateServiceCategoryInput>): ServiceCategory {
    const db = getDatabase();
    const current = this.getCategoryById(id);
    if (!current) throw new Error('Category not found');

    db.prepare(
      'UPDATE service_categories SET name = ?, icon = ?, color = ? WHERE id = ?'
    ).run(
      input.name?.trim() || current.name,
      input.icon || current.icon,
      input.color || current.color,
      id
    );

    return this.getCategoryById(id)!;
  }

  toggleCategory(id: number): ServiceCategory {
    const db = getDatabase();
    db.prepare(
      'UPDATE service_categories SET is_active = CASE WHEN is_active = 1 THEN 0 ELSE 1 END WHERE id = ?'
    ).run(id);
    return this.getCategoryById(id)!;
  }

  deleteCategory(id: number): boolean {
    const db = getDatabase();
    const result = db.prepare('DELETE FROM service_categories WHERE id = ?').run(id);
    return result.changes > 0;
  }

  // ==================== SUBCATEGORY OPERATIONS ====================

  getSubcategories(categoryId?: number): ServiceSubcategory[] {
    const db = getDatabase();
    if (categoryId) {
      return db.prepare(`
        SELECT sc.*, c.name as category_name
        FROM service_subcategories sc
        JOIN service_categories c ON sc.category_id = c.id
        WHERE sc.category_id = ?
        ORDER BY sc.name
      `).all(categoryId) as ServiceSubcategory[];
    }

    return db.prepare(`
      SELECT sc.*, c.name as category_name
      FROM service_subcategories sc
      JOIN service_categories c ON sc.category_id = c.id
      ORDER BY c.name, sc.name
    `).all() as ServiceSubcategory[];
  }

  getSubcategoryById(id: number): ServiceSubcategory | undefined {
    const db = getDatabase();
    return db.prepare(`
      SELECT sc.*, c.name as category_name
      FROM service_subcategories sc
      JOIN service_categories c ON sc.category_id = c.id
      WHERE sc.id = ?
    `).get(id) as ServiceSubcategory | undefined;
  }

  getSubcategoryByName(categoryId: number, name: string): ServiceSubcategory | undefined {
    const db = getDatabase();
    return db.prepare(
      'SELECT * FROM service_subcategories WHERE category_id = ? AND name = ?'
    ).get(categoryId, name.trim()) as ServiceSubcategory | undefined;
  }

  createSubcategory(input: CreateServiceSubcategoryInput): ServiceSubcategory {
    const db = getDatabase();
    const result = db.prepare(
      'INSERT INTO service_subcategories (category_id, name) VALUES (?, ?)'
    ).run(
      input.category_id,
      input.name.trim()
    );

    return this.getSubcategoryById(Number(result.lastInsertRowid))!;
  }

  deleteSubcategory(id: number): boolean {
    const db = getDatabase();
    const result = db.prepare('DELETE FROM service_subcategories WHERE id = ?').run(id);
    return result.changes > 0;
  }

  // ==================== CUSTOM FIELDS OPERATIONS ====================

  getCustomFieldsByCategoryId(categoryId: number): CustomField[] {
    const db = getDatabase();
    return db.prepare(
      'SELECT * FROM custom_fields WHERE category_id = ? ORDER BY display_order ASC, label ASC'
    ).all(categoryId) as CustomField[];
  }

  getCustomFieldById(id: number): CustomField | undefined {
    const db = getDatabase();
    return db.prepare('SELECT * FROM custom_fields WHERE id = ?').get(id) as CustomField | undefined;
  }

  createCustomField(input: CreateCustomFieldInput): CustomField {
    const db = getDatabase();
    const result = db.prepare(`
      INSERT INTO custom_fields (category_id, label, type, required, placeholder, display_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      input.category_id,
      input.label.trim(),
      input.type,
      input.required || 0,
      input.placeholder?.trim() || '',
      input.display_order || 0
    );

    return this.getCustomFieldById(Number(result.lastInsertRowid))!;
  }

  updateCustomField(id: number, input: Partial<CreateCustomFieldInput>): CustomField {
    const db = getDatabase();
    const current = this.getCustomFieldById(id);
    if (!current) throw new Error('Custom field not found');

    db.prepare(`
      UPDATE custom_fields
      SET label = ?, type = ?, required = ?, placeholder = ?, display_order = ?
      WHERE id = ?
    `).run(
      input.label?.trim() ?? current.label,
      input.type ?? current.type,
      input.required ?? current.required,
      input.placeholder?.trim() ?? current.placeholder,
      input.display_order ?? current.display_order,
      id
    );

    return this.getCustomFieldById(id)!;
  }

  deleteCustomField(id: number): boolean {
    const db = getDatabase();
    const result = db.prepare('DELETE FROM custom_fields WHERE id = ?').run(id);
    return result.changes > 0;
  }
}

export const serviceRepository = new ServiceRepository();
