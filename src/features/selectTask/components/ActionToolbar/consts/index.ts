import { MatrixKey } from '@/shared/stores/tasksStore';

/** Quadrant colour dot next to its name in "Move to" */
export const QUADRANT_DOT: Record<MatrixKey, string> = {
  ImportantUrgent: 'bg-red-500',
  ImportantNotUrgent: 'bg-yellow-400',
  NotImportantUrgent: 'bg-blue-500',
  NotImportantNotUrgent: 'bg-green-500',
};
