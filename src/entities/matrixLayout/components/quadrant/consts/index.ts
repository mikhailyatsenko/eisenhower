export const QUADRANT_STYLES = {
  TYPING_NEW_TASK_ACTIVE:
    'animate-from-bottom-appear w-[calc(55%-8px)] h-[calc((100vw)/2-32px)] sm:h-[calc(100vh/2)] transition-[width] duration-300',
  TYPING_NEW_TASK_INACTIVE:
    'w-[calc(45%-8px)] !opacity-25 h-[calc((100vw)/2-32px)] sm:h-[calc(100vh/2)] transition-[width] duration-300',
  DEFAULT:
    'w-[calc(50%-8px)] h-[calc((100vw)/2-32px)] sm:h-[calc(100vh/2-64px)] min-h-40',
  EXPANDED: '!order-first max-h-[calc(100dvh-200px)] min-h-40 w-full !pb-0',
  COLLAPSED: 'h-[calc(100vw/3-48px)] w-[calc((33.333%-8px))]',
  CONTAINER:
    'relative m-1 overflow-hidden rounded-md p-1 pt-4 text-gray-100 ease-in-out sm:p-6 dark:border dark:bg-gray-950',
  TITLE:
    'absolute top-1 right-2 mb-2 text-[0.5rem] text-gray-600 select-none sm:text-sm dark:text-gray-300',
  DRAG_OVER: '!bg-gray-400',
} as const;
