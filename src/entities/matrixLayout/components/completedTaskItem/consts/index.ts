import { MatrixKey } from '@/shared/stores/tasksStore';

// The quadrant's colour, muted: it only backs up the quadrant's name
export const QUADRANT_DOT_CLASS: Record<MatrixKey, string> = {
  ImportantUrgent: 'bg-red-400 dark:bg-red-700',
  ImportantNotUrgent: 'bg-yellow-400 dark:bg-yellow-700',
  NotImportantUrgent: 'bg-blue-400 dark:bg-blue-700',
  NotImportantNotUrgent: 'bg-green-400 dark:bg-green-700',
};

// Above 4.5:1 on the row in both themes, the struck-through text too
export const COMPLETED_ROW_STYLES = {
  ROW: 'relative shrink-0 cursor-pointer list-none rounded-md bg-gray-100 px-2.5 py-2 text-left outline-none dark:bg-gray-800',
  TEXT: 'break-words text-sm leading-snug text-gray-700 line-through decoration-gray-500 sm:text-base sm:leading-5 dark:text-gray-300',
  DETAILS:
    'mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-700 dark:text-gray-300',
  QUADRANT: 'inline-flex items-center gap-1.5',
  DOT: 'inline-block h-2 w-2 shrink-0 rounded-full',
} as const;
