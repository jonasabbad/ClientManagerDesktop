// ============================================================
// Activity Log Repository — Audit trail data access
// ============================================================
import { getDatabase } from '../database/connection';
import type { ActivityLog, ActionType, PaginationParams, PaginatedResult } from '../../shared/types';

export class ActivityLogRepository {
  /**
   * Log an action to the activity log.
   */
  log(action: ActionType, entityType: string, entityId: number | null, details: string): void {
    const db = getDatabase();
    db.prepare(
      `INSERT INTO activity_logs (action, entity_type, entity_id, details)
       VALUES (?, ?, ?, ?)`
    ).run(action, entityType, entityId, details);
  }

  /**
   * Get all activity logs with pagination.
   */
  getAll(params: PaginationParams): PaginatedResult<ActivityLog> {
    const db = getDatabase();
    const { page, limit, search } = params;
    const offset = (page - 1) * limit;

    let whereClause = '';
    const queryParams: unknown[] = [];

    if (search) {
      whereClause = 'WHERE action LIKE ? OR details LIKE ? OR entity_type LIKE ?';
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm, searchTerm);
    }

    const total = db.prepare(
      `SELECT COUNT(*) as count FROM activity_logs ${whereClause}`
    ).get(...queryParams) as { count: number };

    const data = db.prepare(
      `SELECT * FROM activity_logs ${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`
    ).all(...queryParams, limit, offset) as ActivityLog[];

    return {
      data,
      total: total.count,
      page,
      limit,
      totalPages: Math.ceil(total.count / limit),
    };
  }
}

export const activityLogRepository = new ActivityLogRepository();
