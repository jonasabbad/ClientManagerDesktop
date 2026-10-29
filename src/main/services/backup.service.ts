// ============================================================
// Backup Service — Updated for categories/subcategories and independent Glovo
// ============================================================
import { dialog } from 'electron';
import fs from 'fs';
import { getDbPath, resetConnection, getDatabase } from '../database/connection';
import { activityLogRepository } from '../repositories/activity-log.repo';
import type { ApiResponse } from '../../shared/types';

export class BackupService {
  async createBackup(): Promise<ApiResponse<string>> {
    try {
      const dbPath = getDbPath();

      const result = await dialog.showSaveDialog({
        title: 'Save Database Backup',
        defaultPath: `client-manager-backup-${this.getDateStamp()}.db`,
        filters: [
          { name: 'SQLite Database', extensions: ['db'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      });

      if (result.canceled || !result.filePath) {
        return { success: false, error: 'Backup canceled.' };
      }

      const db = getDatabase();
      db.pragma('wal_checkpoint(TRUNCATE)');

      fs.copyFileSync(dbPath, result.filePath);

      activityLogRepository.log('BACKUP', 'system', null, `Backup created: ${result.filePath}`);

      return { success: true, data: result.filePath, message: 'Backup created successfully.' };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async restoreBackup(): Promise<ApiResponse<void>> {
    try {
      const result = await dialog.showOpenDialog({
        title: 'Select Backup File to Restore',
        filters: [
          { name: 'SQLite Database', extensions: ['db'] },
          { name: 'All Files', extensions: ['*'] },
        ],
        properties: ['openFile'],
      });

      if (result.canceled || result.filePaths.length === 0) {
        return { success: false, error: 'Restore canceled.' };
      }

      const backupPath = result.filePaths[0];
      const dbPath = getDbPath();

      resetConnection();

      const safetyBackup = `${dbPath}.safety-${this.getDateStamp()}`;
      if (fs.existsSync(dbPath)) {
        fs.copyFileSync(dbPath, safetyBackup);
      }

      fs.copyFileSync(backupPath, dbPath);

      const walPath = `${dbPath}-wal`;
      const shmPath = `${dbPath}-shm`;
      if (fs.existsSync(walPath)) fs.unlinkSync(walPath);
      if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath);

      return { success: true, message: 'Database restored successfully. The app will restart.' };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async exportCSV(): Promise<ApiResponse<string>> {
    try {
      const result = await dialog.showSaveDialog({
        title: 'Export as CSV',
        defaultPath: `clients-export-${this.getDateStamp()}.csv`,
        filters: [{ name: 'CSV File', extensions: ['csv'] }],
      });

      if (result.canceled || !result.filePath) {
        return { success: false, error: 'Export canceled.' };
      }

      const db = getDatabase();
      const clients = db.prepare(`
        SELECT c.id, c.full_name, c.phone, c.cin, c.notes, c.created_at, c.updated_at
        FROM clients c ORDER BY c.full_name
      `).all() as Array<Record<string, unknown>>;

      const BOM = '\ufeff';
      const headers = ['ID', 'Full Name', 'Phone', 'CIN', 'Notes', 'Created', 'Updated'];
      const rows = clients.map(c =>
        [c.id, c.full_name, c.phone, c.cin, c.notes, c.created_at, c.updated_at]
          .map(v => `"${String(v || '').replace(/"/g, '""')}"`)
          .join(',')
      );

      const csv = BOM + [headers.join(','), ...rows].join('\n');
      fs.writeFileSync(result.filePath, csv, 'utf-8');

      activityLogRepository.log('EXPORT', 'system', null, `CSV export: ${result.filePath}`);

      return { success: true, data: result.filePath, message: 'CSV exported successfully.' };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async exportExcel(): Promise<ApiResponse<string>> {
    try {
      const ExcelJS = await import('exceljs');
      const result = await dialog.showSaveDialog({
        title: 'Export as Excel',
        defaultPath: `clients-export-${this.getDateStamp()}.xlsx`,
        filters: [{ name: 'Excel File', extensions: ['xlsx'] }],
      });

      if (result.canceled || !result.filePath) {
        return { success: false, error: 'Export canceled.' };
      }

      const db = getDatabase();
      const workbook = new ExcelJS.Workbook();

      // Clients sheet
      const clientSheet = workbook.addWorksheet('Clients');
      clientSheet.columns = [
        { header: 'ID', key: 'id', width: 8 },
        { header: 'Full Name', key: 'full_name', width: 30 },
        { header: 'Phone', key: 'phone', width: 15 },
        { header: 'CIN', key: 'cin', width: 15 },
        { header: 'Notes', key: 'notes', width: 30 },
        { header: 'Created', key: 'created_at', width: 20 },
        { header: 'Updated', key: 'updated_at', width: 20 },
      ];

      clientSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      clientSheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1976D2' },
      };

      const clients = db.prepare('SELECT * FROM clients ORDER BY full_name').all();
      clients.forEach(c => clientSheet.addRow(c));

      // Service Codes sheet
      const codesSheet = workbook.addWorksheet('Service Codes');
      codesSheet.columns = [
        { header: 'ID', key: 'id', width: 8 },
        { header: 'Client', key: 'client_name', width: 30 },
        { header: 'Category', key: 'category_name', width: 20 },
        { header: 'Sub-Service', key: 'subcategory_name', width: 20 },
        { header: 'Code', key: 'code', width: 25 },
        { header: 'Label', key: 'label', width: 25 },
        { header: 'Notes', key: 'notes', width: 30 },
        { header: 'Created', key: 'created_at', width: 20 },
      ];

      codesSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      codesSheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF388E3C' },
      };

      const codes = db.prepare(`
        SELECT sc.*, sub.name as subcategory_name, cat.name as category_name, c.full_name as client_name
        FROM service_codes sc
        JOIN service_subcategories sub ON sc.subcategory_id = sub.id
        JOIN service_categories cat ON sub.category_id = cat.id
        JOIN clients c ON sc.client_id = c.id
        ORDER BY c.full_name
      `).all();
      codes.forEach(c => codesSheet.addRow(c));

      // Glovo Riders sheet
      const glovoSheet = workbook.addWorksheet('Glovo Riders');
      glovoSheet.columns = [
        { header: 'ID', key: 'id', width: 8 },
        { header: 'Rider Name', key: 'rider_name', width: 25 },
        { header: 'Rider ID', key: 'rider_id', width: 25 },
        { header: 'Phone', key: 'phone', width: 15 },
        { header: 'Notes', key: 'notes', width: 30 },
        { header: 'Created', key: 'created_at', width: 20 },
      ];

      glovoSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      glovoSheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFC244' },
      };

      const glovoRiders = db.prepare('SELECT * FROM glovo_riders ORDER BY rider_name').all();
      glovoRiders.forEach(g => glovoSheet.addRow(g));

      await workbook.xlsx.writeFile(result.filePath);

      activityLogRepository.log('EXPORT', 'system', null, `Excel export: ${result.filePath}`);

      return { success: true, data: result.filePath, message: 'Excel exported successfully.' };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  async exportPDF(): Promise<ApiResponse<string>> {
    try {
      const result = await dialog.showSaveDialog({
        title: 'Export as PDF',
        defaultPath: `clients-export-${this.getDateStamp()}.pdf`,
        filters: [{ name: 'PDF File', extensions: ['pdf'] }],
      });

      if (result.canceled || !result.filePath) {
        return { success: false, error: 'Export canceled.' };
      }

      const db = getDatabase();
      const clients = db.prepare('SELECT * FROM clients ORDER BY full_name').all() as Array<Record<string, unknown>>;

      let content = 'CLIENT MANAGER - EXPORT\n';
      content += `Date: ${new Date().toISOString()}\n`;
      content += '='.repeat(80) + '\n\n';
      content += 'CLIENTS LIST\n';
      content += '-'.repeat(80) + '\n';

      for (const client of clients) {
        content += `ID: ${client.id} | Name: ${client.full_name} | Phone: ${client.phone || 'N/A'} | CIN: ${client.cin || 'N/A'}\n`;
        content += `  Notes: ${client.notes || 'None'}\n`;
        content += `  Created: ${client.created_at} | Updated: ${client.updated_at}\n`;

        const codes = db.prepare(`
          SELECT sc.code, sub.name as subcategory_name, cat.name as category_name, sc.label
          FROM service_codes sc
          JOIN service_subcategories sub ON sc.subcategory_id = sub.id
          JOIN service_categories cat ON sub.category_id = cat.id
          WHERE sc.client_id = ?
        `).all(client.id) as Array<Record<string, unknown>>;

        if (codes.length > 0) {
          content += '  Service Codes:\n';
          for (const code of codes) {
            content += `    - [${code.category_name} -> ${code.subcategory_name}] ${code.code}${code.label ? ` (${code.label})` : ''}\n`;
          }
        }
        content += '-'.repeat(80) + '\n';
      }

      // Add independent Glovo section
      const riders = db.prepare('SELECT * FROM glovo_riders ORDER BY rider_name').all() as Array<Record<string, unknown>>;
      if (riders.length > 0) {
        content += '\n\nGLOVO RIDERS LIST\n';
        content += '='.repeat(80) + '\n';
        for (const r of riders) {
          content += `Rider ID: ${r.rider_id} | Name: ${r.rider_name} | Phone: ${r.phone || 'N/A'}\n`;
          if (r.notes) content += `  Notes: ${r.notes}\n`;
          content += '-'.repeat(80) + '\n';
        }
      }

      fs.writeFileSync(result.filePath, content, 'utf-8');

      activityLogRepository.log('EXPORT', 'system', null, `PDF export: ${result.filePath}`);

      return { success: true, data: result.filePath, message: 'Export completed successfully.' };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }

  private getDateStamp(): string {
    return new Date().toISOString().slice(0, 10).replace(/-/g, '');
  }
}

export const backupService = new BackupService();
