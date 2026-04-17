import { type MatrixKey } from '@/shared/stores/tasksStore';

export const ERROR_MESSAGE = 'Task text must be between 1 and 200 characters.';
export const BUTTON_TEXT = 'Add Task';

export const BUTTON_COLORS: Record<
  MatrixKey,
  { bg: string; hover: string; peerCheckedBg: string; border: string }
> = {
  ImportantUrgent: {
    bg: 'bg-red-300 dark:bg-red-900/40',
    hover: 'hover:bg-red-400 dark:hover:bg-red-800/60',
    peerCheckedBg: 'peer-checked:bg-red-400 dark:peer-checked:bg-red-800/60',
    border: 'border-red-200 dark:border-red-800/50',
  },
  ImportantNotUrgent: {
    bg: 'bg-yellow-300 dark:bg-yellow-800/40',
    hover: 'hover:bg-yellow-400 dark:hover:bg-yellow-800/60',
    peerCheckedBg:
      'peer-checked:bg-yellow-400 dark:peer-checked:bg-yellow-800/60',
    border: 'border-yellow-200 dark:border-yellow-800/50',
  },
  NotImportantUrgent: {
    bg: 'bg-blue-300 dark:bg-blue-900/40',
    hover: 'hover:bg-blue-400 dark:hover:bg-blue-800/60',
    peerCheckedBg: 'peer-checked:bg-blue-400 dark:peer-checked:bg-blue-800/60',
    border: 'border-blue-200 dark:border-blue-800/50',
  },
  NotImportantNotUrgent: {
    bg: 'bg-green-300 dark:bg-green-900/40',
    hover: 'hover:bg-green-400 dark:hover:bg-green-800/60',
    peerCheckedBg:
      'peer-checked:bg-green-400 dark:peer-checked:bg-green-800/60',
    border: 'border-green-200 dark:border-green-800/50',
  },
};
