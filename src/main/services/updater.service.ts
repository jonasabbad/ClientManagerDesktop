// ============================================================
// Updater Service — Auto-updates from GitHub Releases
// (electron-updater + NSIS). The feed (owner/repo) comes from the
// `publish` section of electron-builder.yml, which electron-builder
// bakes into resources/app-update.yml at build time. No token is
// used: the repository's releases must be public.
// ============================================================
import { app, BrowserWindow } from 'electron';
import { appendFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { autoUpdater } from 'electron-updater';
import type { UpdateInfo, ProgressInfo } from 'electron-updater';
import { closeDatabase } from '../database/connection';
import { isDbBusy, whenDbIdle } from '../database/operation-lock';
import { IPC_CHANNELS } from '../../shared/types';
import type { UpdateStatus } from '../../shared/types';

const STARTUP_CHECK_DELAY_MS = 5000;

const OFFLINE_ERROR_PATTERN =
  /ERR_INTERNET_DISCONNECTED|ERR_NAME_NOT_RESOLVED|ERR_NETWORK_CHANGED|ERR_CONNECTION_(REFUSED|RESET|TIMED_OUT|CLOSED)|ERR_PROXY_CONNECTION_FAILED|ERR_ADDRESS_UNREACHABLE|ENOTFOUND|ECONNREFUSED|ECONNRESET|ETIMEDOUT|EAI_AGAIN/i;

/** Minimal file logger so update problems on users' machines can be diagnosed. */
function log(level: 'info' | 'warn' | 'error', ...args: unknown[]): void {
  const line = `[${new Date().toISOString()}] [${level}] ${args
    .map((a) => (a instanceof Error ? a.stack ?? a.message : typeof a === 'string' ? a : JSON.stringify(a)))
    .join(' ')}\n`;
  console.log(`[Updater] ${line.trim()}`);
  try {
    const dir = join(app.getPath('userData'), 'logs');
    mkdirSync(dir, { recursive: true });
    appendFileSync(join(dir, 'updater.log'), line, 'utf-8');
  } catch {
    // Logging must never break updating.
  }
}

/**
 * Only NSIS installs can update themselves: dev runs and the portable
 * build (which sets PORTABLE_EXECUTABLE_FILE) are excluded.
 */
const UPDATES_SUPPORTED = app.isPackaged && !process.env.PORTABLE_EXECUTABLE_FILE;

class UpdaterService {
  private status: UpdateStatus = {
    state: UPDATES_SUPPORTED ? 'idle' : 'disabled',
    currentVersion: app.getVersion(),
  };
  private initialized = false;
  private installRequested = false;

  init(): void {
    if (this.initialized || !UPDATES_SUPPORTED) return;
    this.initialized = true;

    autoUpdater.logger = {
      info: (m: unknown) => log('info', m),
      warn: (m: unknown) => log('warn', m),
      error: (m: unknown) => log('error', m),
      debug: () => {},
    };
    autoUpdater.autoDownload = true;
    // If the user picks "Later", install silently the next time they quit.
    autoUpdater.autoInstallOnAppQuit = true;
    autoUpdater.allowDowngrade = false;
    autoUpdater.allowPrerelease = false;

    autoUpdater.on('checking-for-update', () => {
      this.setStatus({ state: 'checking', error: undefined, errorKind: undefined });
    });
    autoUpdater.on('update-not-available', (info: UpdateInfo) => {
      this.setStatus({ state: 'not-available', version: info.version });
    });
    autoUpdater.on('update-available', (info: UpdateInfo) => {
      this.setStatus({ state: 'available', version: info.version, percent: 0 });
    });
    autoUpdater.on('download-progress', (progress: ProgressInfo) => {
      this.setStatus({ state: 'downloading', percent: Math.floor(progress.percent) });
    });
    autoUpdater.on('update-downloaded', (info: UpdateInfo) => {
      this.setStatus({ state: 'downloaded', version: info.version, percent: 100 });
    });
    autoUpdater.on('error', (error: Error) => {
      this.handleError(error);
    });

    log('info', `Updater initialised, current version ${app.getVersion()}`);
    setTimeout(() => { void this.check(false); }, STARTUP_CHECK_DELAY_MS);
  }

  getStatus(): UpdateStatus {
    return this.status;
  }

  /**
   * Checks GitHub for a newer release. Repeated calls while a check or
   * download is in flight (or an update is already waiting) are no-ops,
   * so the user never gets duplicate downloads or dialogs.
   */
  async check(manual: boolean): Promise<UpdateStatus> {
    if (!UPDATES_SUPPORTED) return this.status;
    if (['checking', 'available', 'downloading', 'downloaded'].includes(this.status.state)) {
      return this.status;
    }

    this.setStatus({ state: 'checking', manual, error: undefined, errorKind: undefined });
    try {
      await autoUpdater.checkForUpdates();
    } catch (error) {
      this.handleError(error as Error);
    }
    return this.status;
  }

  /** Quits and installs the downloaded update, after any critical DB work. */
  async install(): Promise<UpdateStatus> {
    if (this.status.state !== 'downloaded' || this.installRequested) return this.status;
    this.installRequested = true;

    if (isDbBusy()) {
      log('info', 'Install requested while a database operation is running; waiting.');
      this.setStatus({ waitingForDb: true });
      await whenDbIdle();
      this.setStatus({ waitingForDb: false });
    }

    log('info', `Installing ${this.status.version} and relaunching.`);
    // Flush the WAL and release the SQLite file before the installer runs.
    closeDatabase();
    // Defer so the IPC reply reaches the renderer before the app quits.
    setImmediate(() => autoUpdater.quitAndInstall(true, true));
    return this.status;
  }

  private handleError(error: Error): void {
    const message = error?.message ?? String(error);
    const offline = OFFLINE_ERROR_PATTERN.test(message);
    log(offline ? 'warn' : 'error', 'Update error:', error);
    // A failed download leaves nothing to install; let the next check retry.
    this.setStatus({
      state: 'error',
      errorKind: offline ? 'offline' : 'other',
      // Keep the UI message short; the full stack is in the log file.
      error: message.split('\n')[0].slice(0, 300),
      percent: undefined,
    });
  }

  private setStatus(patch: Partial<UpdateStatus>): void {
    this.status = { ...this.status, ...patch };
    for (const win of BrowserWindow.getAllWindows()) {
      if (!win.isDestroyed()) win.webContents.send(IPC_CHANNELS.UPDATER_STATUS_EVENT, this.status);
    }
  }
}

export const updaterService = new UpdaterService();
