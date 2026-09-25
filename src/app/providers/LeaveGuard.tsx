'use client';

import { useEffect } from 'react';
import {
  selectHasPendingChanges,
  useSyncStore,
} from '@/shared/stores/syncStore';

const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
  event.preventDefault();
  // Browsers that predate preventDefault here (Chrome and Edge before 119)
  event.returnValue = true;
};

/**
 * While changes wait for the cloud, closing or reloading the tab brings up
 * the browser's own warning. The queue may live only in the tab's memory
 * (the SDK falls back to memory cache), so it warns in any cache mode. With
 * nothing pending there is no listener: the tab closes quietly.
 */
export const LeaveGuard = () => {
  const hasPendingChanges = useSyncStore(selectHasPendingChanges);

  useEffect(() => {
    if (!hasPendingChanges) return;
    window.addEventListener('beforeunload', warnBeforeLeaving);
    return () => window.removeEventListener('beforeunload', warnBeforeLeaving);
  }, [hasPendingChanges]);

  return null;
};
