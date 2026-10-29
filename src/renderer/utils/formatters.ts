// ============================================================
// Formatters — Date, number, and string formatting utilities
// ============================================================

/**
 * Format a date string to a localized display format.
 */
export function formatDate(dateStr: string, locale: string = 'fr-FR'): string {
  if (!dateStr) return '—';
  try {
    const date = new Date(dateStr + 'Z');
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Format a date string with time.
 */
export function formatDateTime(dateStr: string, locale: string = 'fr-FR'): string {
  if (!dateStr) return '—';
  try {
    const date = new Date(dateStr + 'Z');
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Format a relative time string (e.g., "2 hours ago").
 */
export function formatRelativeTime(dateStr: string): string {
  if (!dateStr) return '—';
  try {
    const date = new Date(dateStr + 'Z');
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins}m`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return formatDate(dateStr);
  } catch {
    return dateStr;
  }
}

/**
 * Truncate a string to a maximum length.
 */
export function truncate(str: string, maxLen: number = 50): string {
  if (!str) return '';
  return str.length > maxLen ? str.slice(0, maxLen) + '…' : str;
}
