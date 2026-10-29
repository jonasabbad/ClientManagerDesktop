// ============================================================
// Dashboard Repository — Aggregated stats for new schema
// ============================================================
import { getDatabase } from '../database/connection';
import { serviceCodeRepository } from './service-code.repo';
import type { DashboardStats, Client, ActivityLog } from '../../shared/types';

export class DashboardRepository {
  /**
   * Get all dashboard statistics in one call.
   */
  getStats(): DashboardStats {
    const db = getDatabase();

    const totalClients = (db.prepare(
      'SELECT COUNT(*) as count FROM clients'
    ).get() as { count: number }).count;

    const totalCodes = (db.prepare(
      'SELECT COUNT(*) as count FROM service_codes'
    ).get() as { count: number }).count;

    const todayNewClients = (db.prepare(
      "SELECT COUNT(*) as count FROM clients WHERE date(created_at) = date('now')"
    ).get() as { count: number }).count;

    const totalGlovoRiders = (db.prepare(
      'SELECT COUNT(*) as count FROM glovo_riders'
    ).get() as { count: number }).count;

    // Call serviceCodeRepository for codes per service (grouped by category)
    const codesPerService = serviceCodeRepository.countByCategory();

    const latestClients = db.prepare(
      'SELECT * FROM clients ORDER BY created_at DESC LIMIT 10'
    ).all() as Client[];

    const recentActivity = db.prepare(
      'SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 20'
    ).all() as ActivityLog[];

    return {
      totalClients,
      totalCodes,
      todayNewClients,
      totalGlovoRiders,
      codesPerService,
      latestClients,
      recentActivity,
    };
  }
}

export const dashboardRepository = new DashboardRepository();
