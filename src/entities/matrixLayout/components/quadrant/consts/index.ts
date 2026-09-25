import { MatrixKey } from '@/shared/stores/tasksStore';

// On a phone the 2×2 fills the screen under the header: each row is half of
// what's left after the header, the title, the axis labels and the gaps
const PHONE_HEIGHT = 'h-[calc(50dvh-88px)]';

export const QUADRANT_STYLES = {
  TYPING_NEW_TASK_ACTIVE: `animate-from-bottom-appear w-[calc(55%-8px)] ${PHONE_HEIGHT} sm:h-[calc(100vh/2)] transition-[width] duration-300`,
  TYPING_NEW_TASK_INACTIVE: `w-[calc(45%-8px)] !opacity-25 ${PHONE_HEIGHT} sm:h-[calc(100vh/2)] transition-[width] duration-300`,
  DEFAULT: `w-[calc(50%-8px)] ${PHONE_HEIGHT} sm:h-[calc(100vh/2-64px)] min-h-40`,
  CONTAINER:
    'relative m-1 flex cursor-pointer flex-col overflow-hidden rounded-md p-1 ease-in-out sm:p-6 dark:border dark:bg-gray-950',
  // Alone in the grid's box: two rows of PHONE_HEIGHT (100dvh - 176px) and
  // their m-1 margins (16px), less its own margin (8px). Change with PHONE_HEIGHT.
  FULL_SCREEN: 'h-[calc(100dvh-168px)] w-[calc(100%-8px)]',
  // The cell's m-1 leaves room for the ring. Its colour: DRAG_OVER_RING
  DRAG_OVER: 'ring-4',
} as const;

// The ring lies outside the cell, against the page and the cell's own edge:
// 700 on white and on the 200 fill, 400 on the dark page, all above 3:1
export const DRAG_OVER_RING: Record<MatrixKey, string> = {
  ImportantUrgent: 'ring-red-700 dark:ring-red-400',
  ImportantNotUrgent: 'ring-yellow-700 dark:ring-yellow-400',
  NotImportantUrgent: 'ring-blue-700 dark:ring-blue-400',
  NotImportantNotUrgent: 'ring-green-700 dark:ring-green-400',
};
