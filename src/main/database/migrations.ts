// ============================================================
// Database Migrations — Restructured for Categories, Sub-Services & Custom Fields
// ============================================================
import { getDatabase } from './connection';

/**
 * Runs all database migrations.
 * Recreates tables with the new schema if upgrading.
 */
export function runMigrations(): void {
  try {
    const db = getDatabase();

  const customFieldsTableExists = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='custom_fields'")
    .get();

  if (!customFieldsTableExists) {
    console.log('[DB] Upgrading schema: Creating Custom Fields tables...');
    // Drop old tables so we can build them fresh with correct constraints
    db.exec(`
      DROP TABLE IF EXISTS service_code_custom_values;
      DROP TABLE IF EXISTS custom_fields;
      DROP TABLE IF EXISTS service_codes;
      DROP TABLE IF EXISTS service_subcategories;
      DROP TABLE IF EXISTS service_categories;
      DROP TABLE IF EXISTS clients;
      DROP TABLE IF EXISTS glovo_riders;
    `);
  }

  // Check if main table exists
  const tableExists = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='service_categories'")
    .get();

  if (!tableExists) {
    console.log('[DB] Running full database schema migration...');

    const migration = db.transaction(() => {
    // ==================== SERVICE CATEGORIES ====================
    db.exec(`
      CREATE TABLE IF NOT EXISTS service_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        icon TEXT DEFAULT '',
        color TEXT DEFAULT '#1976d2',
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now'))
      );
    `);

    // ==================== SERVICE SUBCATEGORIES ====================
    db.exec(`
      CREATE TABLE IF NOT EXISTS service_subcategories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE CASCADE,
        UNIQUE(category_id, name)
      );
    `);

    // ==================== CUSTOM FIELDS ====================
    db.exec(`
      CREATE TABLE IF NOT EXISTS custom_fields (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER NOT NULL,
        label TEXT NOT NULL,
        type TEXT NOT NULL,
        required INTEGER DEFAULT 0,
        placeholder TEXT DEFAULT '',
        display_order INTEGER DEFAULT 0,
        FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE CASCADE
      );
    `);

    // ==================== CLIENTS ====================
    db.exec(`
      CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        phone TEXT DEFAULT '',
        cin TEXT DEFAULT '',
        notes TEXT DEFAULT '',
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );
    `);

    // ==================== SERVICE CODES ====================
    db.exec(`
      CREATE TABLE IF NOT EXISTS service_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER NOT NULL,
        subcategory_id INTEGER NOT NULL,
        code TEXT NOT NULL UNIQUE,
        label TEXT DEFAULT '',
        notes TEXT DEFAULT '',
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
        FOREIGN KEY (subcategory_id) REFERENCES service_subcategories(id) ON DELETE CASCADE
      );
    `);

    // ==================== CUSTOM VALUES FOR CODES ====================
    db.exec(`
      CREATE TABLE IF NOT EXISTS service_code_custom_values (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        service_code_id INTEGER NOT NULL,
        field_id INTEGER NOT NULL,
        value TEXT DEFAULT '',
        FOREIGN KEY (service_code_id) REFERENCES service_codes(id) ON DELETE CASCADE,
        FOREIGN KEY (field_id) REFERENCES custom_fields(id) ON DELETE CASCADE,
        UNIQUE(service_code_id, field_id)
      );
    `);

    // ==================== GLOVO RIDERS ====================
    db.exec(`
      CREATE TABLE IF NOT EXISTS glovo_riders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        rider_name TEXT NOT NULL,
        rider_id TEXT NOT NULL UNIQUE,
        phone TEXT DEFAULT '',
        email TEXT DEFAULT '',
        city TEXT DEFAULT '',
        notes TEXT DEFAULT '',
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );
    `);

    // ==================== ACTIVITY LOGS ====================
    db.exec(`
      CREATE TABLE IF NOT EXISTS activity_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT NOT NULL,
        entity_type TEXT DEFAULT '',
        entity_id INTEGER,
        details TEXT DEFAULT '',
        created_at TEXT DEFAULT (datetime('now'))
      );
    `);

    // ==================== INDEXES FOR PERFORMANCE ====================
    db.exec(`CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(full_name);`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_clients_cin ON clients(cin);`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_clients_created ON clients(created_at);`);

    db.exec(`CREATE INDEX IF NOT EXISTS idx_service_codes_code ON service_codes(code);`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_service_codes_client ON service_codes(client_id);`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_service_codes_subcat ON service_codes(subcategory_id);`);

    db.exec(`CREATE INDEX IF NOT EXISTS idx_custom_fields_cat ON custom_fields(category_id);`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_custom_values_code ON service_code_custom_values(service_code_id);`);

    db.exec(`CREATE INDEX IF NOT EXISTS idx_glovo_rider_id ON glovo_riders(rider_id);`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_glovo_rider_name ON glovo_riders(rider_name);`);

    db.exec(`CREATE INDEX IF NOT EXISTS idx_activity_logs_date ON activity_logs(created_at);`);
    db.exec(`CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);`);

    // ==================== SEED CATEGORIES, SUBCATEGORIES, & CUSTOM FIELDS ====================
    const insertCategory = db.prepare('INSERT INTO service_categories (name, icon, color) VALUES (?, ?, ?)');
    const insertSubcategory = db.prepare('INSERT INTO service_subcategories (category_id, name) VALUES (?, ?)');
    const insertField = db.prepare(
      'INSERT INTO custom_fields (category_id, label, type, required, placeholder, display_order) VALUES (?, ?, ?, ?, ?, ?)'
    );

    // SRM Category
    let res = insertCategory.run('SRM', 'Business', '#1976d2');
    let catId = Number(res.lastInsertRowid);
    insertSubcategory.run(catId, 'Water');
    insertSubcategory.run(catId, 'Electricity');
    // SRM Custom fields
    insertField.run(catId, 'Customer Name', 'text', 1, 'Nom du client SRM', 1);
    insertField.run(catId, 'Address', 'textarea', 0, 'Adresse de livraison/compteur', 2);

    // IAM Category
    res = insertCategory.run('IAM', 'SimCard', '#006233');
    catId = Number(res.lastInsertRowid);
    insertSubcategory.run(catId, 'Mobile');
    insertSubcategory.run(catId, 'Internet');
    insertSubcategory.run(catId, 'Fiber');
    insertSubcategory.run(catId, 'Telephone');
    // IAM Custom fields
    insertField.run(catId, 'Customer Name', 'text', 1, 'Nom complet du titulaire', 1);
    insertField.run(catId, 'Installation Address', 'textarea', 1, 'Adresse d\'installation de la ligne', 2);
    insertField.run(catId, 'Contract Number', 'text', 0, 'Numéro de contrat/abonnement', 3);

    // Orange Category
    res = insertCategory.run('Orange', 'SimCard', '#ff5722');
    catId = Number(res.lastInsertRowid);
    insertSubcategory.run(catId, 'Mobile');
    insertSubcategory.run(catId, 'Internet');
    insertSubcategory.run(catId, 'Fiber');
    // Orange Custom fields
    insertField.run(catId, 'Customer Name', 'text', 1, 'Nom du client Orange', 1);
    insertField.run(catId, 'SIM Number', 'number', 0, 'Numéro de carte SIM', 2);

    // INWI Category
    res = insertCategory.run('INWI', 'SimCard', '#6a1b9a');
    catId = Number(res.lastInsertRowid);
    insertSubcategory.run(catId, 'Mobile');
    insertSubcategory.run(catId, 'Internet');
    insertSubcategory.run(catId, 'Fiber');

    // Lydec Category
    res = insertCategory.run('Lydec', 'Water', '#0288d1');
    catId = Number(res.lastInsertRowid);
    insertSubcategory.run(catId, 'Water');
    insertSubcategory.run(catId, 'Electricity');

    db.prepare(
      "INSERT INTO activity_logs (action, entity_type, details) VALUES (?, ?, ?)"
    ).run('CREATE_SERVICE_CATEGORY', 'system', 'Schema initialized with categories, subcategories, and custom fields');
  });

  migration();
  console.log('[DB] Restructured migrations with custom fields completed successfully.');
  } else {
    console.log('[DB] Main tables already exist, checking for table column upgrades.');
  }

  // ==================== ADDITIVE MIGRATIONS (safe for existing databases) ====================
  // Add new columns to glovo_riders if they don't exist yet
  const glovoColumns = db.prepare("PRAGMA table_info(glovo_riders)").all() as Array<{ name: string }>;
  const glovoColNames = glovoColumns.map(c => c.name);

  if (!glovoColNames.includes('email')) {
    db.exec("ALTER TABLE glovo_riders ADD COLUMN email TEXT DEFAULT ''");
    console.log('[DB] Added email column to glovo_riders');
  }
  if (!glovoColNames.includes('city')) {
    db.exec("ALTER TABLE glovo_riders ADD COLUMN city TEXT DEFAULT ''");
    console.log('[DB] Added city column to glovo_riders');
  }
  if (!glovoColNames.includes('updated_at')) {
    db.exec("ALTER TABLE glovo_riders ADD COLUMN updated_at TEXT DEFAULT ''");
    db.exec("UPDATE glovo_riders SET updated_at = datetime('now') WHERE updated_at IS NULL OR updated_at = ''");
    console.log('[DB] Added updated_at column to glovo_riders and updated existing rows.');
  }
  } catch (error) {
    console.error('[DB] SQLite database migration failed:', error);
    throw error;
  }
}
