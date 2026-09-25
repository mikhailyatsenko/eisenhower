import { MatrixKey } from '@/shared/stores/tasksStore';

/** Quadrant colour dot next to its name in "Move to" */
export const QUADRANT_DOT: Record<MatrixKey, string> = {
  ImportantUrgent: 'bg-red-500',
  ImportantNotUrgent: 'bg-yellow-400',
  NotImportantUrgent: 'bg-blue-500',
  NotImportantNotUrgent: 'bg-green-500',
};

const BUTTON =
  'cursor-pointer rounded-lg px-3 py-2 hover:bg-white/10 disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent';

/** One row at the bottom centre on desktop, a full-width panel on a phone */
export const PANEL_STYLES = {
  desktop: {
    TOOLBAR:
      'fixed bottom-4 left-1/2 z-40 flex w-max max-w-[calc(100%-2rem)] -translate-x-1/2 flex-wrap items-center justify-center gap-1 rounded-xl bg-gray-900 p-1.5 text-sm text-white shadow-2xl dark:bg-gray-800',
    BUTTON,
    MOVE_TO: 'flex flex-wrap items-center justify-center gap-1',
    MOVE_TO_LABEL: 'px-1 text-gray-300',
    MOVE_TO_GRID: 'contents',
    MOVE_TO_BUTTON: 'px-2',
    DESELECT_BUTTON: 'flex items-center',
  },
  // Every target is at least 44×44 (min-h-11)
  phone: {
    TOOLBAR:
      'fixed inset-x-0 bottom-0 z-40 rounded-t-2xl bg-gray-900 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-sm text-white shadow-2xl dark:bg-gray-800',
    BUTTON: `${BUTTON} min-h-11 bg-white/5 px-2`,
    MOVE_TO: 'mt-3',
    MOVE_TO_LABEL: 'mb-1.5 block px-1 text-xs text-gray-300',
    MOVE_TO_GRID: 'grid grid-cols-2 gap-2',
    MOVE_TO_BUTTON: 'flex items-center px-3 text-left font-bold',
    TASK_ROW: 'mb-2 flex items-center gap-2',
    TASK_TEXT: 'line-clamp-1 min-w-0 flex-1 px-1 opacity-80',
    DESELECT_BUTTON: 'flex min-w-11 shrink-0 items-center justify-center',
    ACTIONS_ROW: 'grid grid-cols-3 gap-2',
  },
} as const;
