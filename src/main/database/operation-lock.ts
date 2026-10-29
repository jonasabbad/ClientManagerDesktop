// ============================================================
// Critical Operation Lock — Tracks long-running database work
// (backup, restore, exports) so the auto-updater never quits the
// app in the middle of it.
// ============================================================

let activeOperations = 0;
let idleWaiters: Array<() => void> = [];

/**
 * Runs `operation` while marking the database as busy.
 * Regular CRUD calls are synchronous (better-sqlite3) and cannot be
 * interrupted, so only async multi-step operations need this.
 */
export async function runCriticalDbOperation<T>(operation: () => Promise<T>): Promise<T> {
  activeOperations++;
  try {
    return await operation();
  } finally {
    activeOperations--;
    if (activeOperations === 0) {
      const waiters = idleWaiters;
      idleWaiters = [];
      waiters.forEach((resolve) => resolve());
    }
  }
}

export function isDbBusy(): boolean {
  return activeOperations > 0;
}

/** Resolves once no critical database operation is running. */
export function whenDbIdle(): Promise<void> {
  if (activeOperations === 0) return Promise.resolve();
  return new Promise((resolve) => idleWaiters.push(resolve));
}
