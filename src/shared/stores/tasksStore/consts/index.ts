import type { MatrixKey } from '@/shared/consts';

export const STORAGE_KEY = 'task-store';

export const LOCAL_STATE_KEY = 'local';
export const CLOUD_STATE_KEY = 'firebase';

/** Where Restore puts a completed task that doesn't remember its quadrant */
export const RESTORE_FALLBACK_QUADRANT =
  'NotImportantNotUrgent' satisfies MatrixKey;
