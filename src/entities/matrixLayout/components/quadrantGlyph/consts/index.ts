import { MatrixKey } from '@/shared/stores/tasksStore';

// The quadrant's own cell; decorative, the title next to it names the quadrant
export const GLYPH_CELL_CLASS: Record<MatrixKey, string> = {
  ImportantUrgent: 'bg-red-500',
  ImportantNotUrgent: 'bg-yellow-500',
  NotImportantUrgent: 'bg-blue-500',
  NotImportantNotUrgent: 'bg-green-500',
};

export const GLYPH_OTHER_CELL_CLASS = 'bg-gray-300 dark:bg-gray-700';
