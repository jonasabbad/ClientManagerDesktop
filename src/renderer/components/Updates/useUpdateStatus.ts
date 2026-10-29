// ============================================================
// useUpdateStatus — Live auto-update status from the main process
// ============================================================
import { useEffect, useState } from 'react';
import type { UpdateStatus } from '../../types';

export function useUpdateStatus(): UpdateStatus | null {
  const [status, setStatus] = useState<UpdateStatus | null>(null);

  useEffect(() => {
    let active = true;
    window.api.updater.getStatus()
      .then((s) => { if (active) setStatus(s); })
      .catch(() => { /* status stays unknown; the UI hides itself */ });
    const unsubscribe = window.api.updater.onStatus((s) => setStatus(s));
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return status;
}
