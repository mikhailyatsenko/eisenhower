import { HEADER_FOCUS_RING } from '../../../consts';

export const HEADER_STYLES = {
  // In the flow on a phone, in the top padding on wider screens
  HEADER:
    'flex shrink-0 items-baseline gap-1 px-1 pb-1 select-none sm:absolute sm:top-1 sm:right-2 sm:p-0',
  TITLE: 'text-xs font-bold text-gray-900 sm:text-sm dark:text-gray-100',
  COUNT: 'text-xs text-gray-700 sm:text-sm dark:text-gray-300',
  // The grid's title on a phone: a button, 44px tall, that opens the quadrant.
  // In a 320px screen's cell the count goes under the title, by "+ Add".
  GRID_HEADER: 'flex shrink-0 items-center gap-1 px-1 pb-1 select-none',
  OPEN_HEADING: 'min-w-0 flex-1',
  OPEN_BUTTON: `-my-1 flex min-h-11 w-full cursor-pointer flex-wrap items-center gap-x-1 rounded-md text-left ${HEADER_FOCUS_RING}`,
  FULL_SCREEN_HEADER: 'flex shrink-0 items-center gap-2 pb-1 select-none',
  BACK_BUTTON: `flex min-h-11 min-w-11 cursor-pointer items-center gap-1 rounded-md px-2 text-sm font-semibold text-gray-900 hover:bg-black/10 dark:text-gray-100 dark:hover:bg-white/10 ${HEADER_FOCUS_RING}`,
  FULL_SCREEN_TITLE: `ml-auto rounded-sm text-base font-bold text-gray-900 dark:text-gray-100 ${HEADER_FOCUS_RING}`,
} as const;
