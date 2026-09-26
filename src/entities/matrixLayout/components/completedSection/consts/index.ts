export const COMPLETED_SECTION_STYLES = {
  TITLE: 'shrink-0 text-base font-bold text-gray-800 dark:text-gray-200',
  // The only destructive control of the header: 44px tall like the toggle
  DELETE_ALL:
    'min-h-11 shrink-0 cursor-pointer rounded-md px-2 text-sm font-bold text-red-700 hover:bg-red-50 disabled:cursor-default disabled:opacity-60 dark:text-red-300 dark:hover:bg-red-950/40',
  ERROR: 'px-1 pb-2 text-sm font-medium text-red-700 dark:text-red-300',
  LIST: 'flex list-none flex-col gap-2 pt-1 pb-6',
} as const;
