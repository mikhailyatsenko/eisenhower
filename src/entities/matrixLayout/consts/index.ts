import { MatrixKey } from '@/shared/stores/tasksStore';

export const BUTTON_CANCEL_TEXT = 'Cancel';
export const BUTTON_SAVE_TEXT = 'Save';

// Task card background per quadrant
export const colors: Record<MatrixKey, string> = {
  ImportantUrgent: 'bg-red-300 dark:bg-red-900/40',
  ImportantNotUrgent: 'bg-yellow-300/75 dark:bg-yellow-800/40',
  NotImportantUrgent: 'bg-blue-300 dark:bg-blue-900/40',
  NotImportantNotUrgent: 'bg-green-300/95 dark:bg-green-900/40',
};

// Box of a task card in the matrix and of its drag preview; compact on a phone
export const TASK_CARD_CLASS =
  'relative min-h-8 shrink-0 list-none rounded-md px-1.5 py-1 text-left sm:min-h-10 sm:px-2.5 sm:py-2 sm:text-center';
