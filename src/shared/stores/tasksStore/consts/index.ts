import type { MatrixKey } from '@/shared/consts';

export const STORAGE_KEY = 'task-store';

/** Where Restore puts a completed task that doesn't remember its quadrant */
export const RESTORE_FALLBACK_QUADRANT =
  'NotImportantNotUrgent' satisfies MatrixKey;
