import { MatrixKey } from '@/shared/stores/tasksStore';

// Keyboard focus ring of the buttons in quadrant and section headers
export const HEADER_FOCUS_RING =
  'outline-hidden focus-visible:outline-2 focus-visible:outline-indigo-700 dark:focus-visible:outline-indigo-300';

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

// A task's option in the matrix, List view and Completed: selected, or not
export const OPTION_SELECTION_CLASS = {
  selected:
    'ring-2 ring-indigo-700 ring-offset-2 dark:ring-indigo-300 dark:ring-offset-gray-950',
  // Focused, not selected (after Esc or "×"): dashed, unlike the selection
  idle: 'hover:ring-1 hover:ring-gray-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700 focus-visible:outline-dashed dark:focus-visible:outline-indigo-300',
} as const;
