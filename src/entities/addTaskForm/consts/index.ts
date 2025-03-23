import { type MatrixKey } from '@/shared/stores/tasksStore';

export const ERROR_MESSAGE = 'Task text must be between 1 and 200 characters.';
export const BUTTON_TEXT = 'Add Task';

export const BUTTON_COLORS: Record<
  MatrixKey,
  { bg: string; hover: string; peerCheckedBg: string; border: string }
> = {
  ImportantUrgent: {
    bg: 'bg-red-300',
    hover: 'hover:bg-red-400',
    peerCheckedBg: 'peer-checked:bg-red-400',
    border: 'border-red-200',
  },
  ImportantNotUrgent: {
    bg: 'bg-amber-300',
    hover: 'hover:bg-amber-400',
    peerCheckedBg: 'peer-checked:bg-amber-400',
    border: 'border-amber-200',
  },
  NotImportantUrgent: {
    bg: 'bg-blue-300',
    hover: 'hover:bg-blue-400',
    peerCheckedBg: 'peer-checked:bg-blue-400',
    border: 'border-blue-200',
  },
  NotImportantNotUrgent: {
    bg: 'bg-green-300',
    hover: 'hover:bg-green-400',
    peerCheckedBg: 'peer-checked:bg-green-400',
    border: 'border-green-200',
  },
};
