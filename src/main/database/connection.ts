// ============================================================
// SQLite Database Connection — Singleton with WAL mode
// ============================================================
import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'path';
import fs from 'fs';

let db: Database.Database | null = null;

/**
 * Returns the path to the SQLite database file.
 * Stored in the user's app data directory for persistence.
 */
export function getDbPath(): string {
  const userDataPath = app.getPath('userData');
  const dbDir = path.join(userDataPath, 'data');

  // Ensure directory exists
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  return path.join(dbDir, 'client-manager.db');
}

/**
 * Returns the singleton database connection.
 * Configures WAL mode, foreign keys, and performance pragmas.
 */
export function getDatabase(): Database.Database {
  if (db) return db;

  const dbPath = getDbPath();

  db = new Database(dbPath, {
    // Enable verbose logging in development
    verbose: process.env.NODE_ENV === 'development' ? console.log : undefined,
  });

  // Performance & safety pragmas
  db.pragma('journal_mode = WAL');          // Write-Ahead Logging for concurrent reads
  db.pragma('foreign_keys = ON');            // Enforce foreign key constraints
  db.pragma('synchronous = NORMAL');         // Balance safety vs speed
  db.pragma('cache_size = -64000');           // 64MB cache
  db.pragma('temp_store = MEMORY');           // Store temp tables in memory
  db.pragma('mmap_size = 268435456');         // 256MB memory-mapped I/O

  return db;
}

/**
 * Closes the database connection gracefully.
 * Should be called on app quit.
 */
export function closeDatabase(): void {
  if (db) {
    db.close();
    db = null;
  }
}

/**
 * Resets the database connection (used after restore).
 */
export function resetConnection(): void {
  closeDatabase();
}
