// On a phone the 2×2 fills the screen under the header: each row is half of
// what's left after the header, the title, the axis labels and the gaps
const PHONE_HEIGHT = 'h-[calc(50dvh-88px)]';

export const QUADRANT_STYLES = {
  TYPING_NEW_TASK_ACTIVE: `animate-from-bottom-appear w-[calc(55%-8px)] ${PHONE_HEIGHT} sm:h-[calc(100vh/2)] transition-[width] duration-300`,
  TYPING_NEW_TASK_INACTIVE: `w-[calc(45%-8px)] !opacity-25 ${PHONE_HEIGHT} sm:h-[calc(100vh/2)] transition-[width] duration-300`,
  DEFAULT: `w-[calc(50%-8px)] ${PHONE_HEIGHT} sm:h-[calc(100vh/2-64px)] min-h-40`,
  CONTAINER:
    'relative m-1 flex flex-col overflow-hidden rounded-md p-1 ease-in-out sm:p-6 dark:border dark:bg-gray-950',
  // In the flow on a phone, in the top padding on wider screens
  HEADER:
    'flex shrink-0 items-baseline gap-1 px-1 pb-1 select-none sm:absolute sm:top-1 sm:right-2 sm:p-0',
  TITLE: 'text-xs font-bold text-gray-900 sm:text-sm dark:text-gray-100',
  COUNT: 'text-xs text-gray-700 sm:text-sm dark:text-gray-300',
  DRAG_OVER: '!bg-gray-400',
} as const;
