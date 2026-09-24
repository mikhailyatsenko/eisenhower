import { MatrixKey } from '@/shared/stores/tasksStore';

export const BUTTON_CANCEL_TEXT = 'Cancel';
export const BUTTON_SAVE_TEXT = 'Save';

// CSS values
export const CSS_VALUES = {
  DEFAULT_QUADRANT_WIDTH: 'calc(50%-8px)',
  DEFAULT_QUADRANT_HEIGHT: 'calc((100vw)/2-32px)',
  DEFAULT_QUADRANT_SM_HEIGHT: 'calc(100vh/2)',
  DEFAULT_QUADRANT_SM_HEIGHT_COLLAPSED: 'calc(100vh/2-64px)',
  COLLAPSED_QUADRANT_HEIGHT: 'calc(100vw/3-48px)',
  COLLAPSED_QUADRANT_WIDTH: 'calc((33.333%-8px))',
  EXPANDED_MAX_HEIGHT: 'calc(100dvh-200px)',
  MIN_HEIGHT: '40px',
} as const;

// Task count text styles
export const TASK_COUNT_STYLES = {
  DEFAULT:
    'text-foreground absolute top-0 left-1 z-0 text-7xl opacity-15 select-none sm:top-1 sm:left-6 sm:text-sm sm:opacity-50',
  EMPTY:
    'text-foreground absolute top-0 left-1 z-0 text-7xl opacity-15 select-none sm:top-1 sm:left-6 sm:text-sm sm:opacity-50 sm:!text-7xl sm:!opacity-25',
} as const;

// Task card background per quadrant
export const colors: Record<MatrixKey, string> = {
  ImportantUrgent: 'bg-red-300 dark:bg-red-900/40',
  ImportantNotUrgent: 'bg-yellow-300/75 dark:bg-yellow-800/40',
  NotImportantUrgent: 'bg-blue-300 dark:bg-blue-900/40',
  NotImportantNotUrgent: 'bg-green-300/95 dark:bg-green-900/40',
};

// Box of a task card in the matrix and of its drag preview
export const TASK_CARD_CLASS =
  'relative min-h-10 shrink-0 list-none rounded-md px-2.5 py-2 text-center';
