export const BUTTON_CANCEL_TEXT = 'Cancel';
export const BUTTON_SAVE_TEXT = 'Save';

// CSS values
export const CSS_VALUES = {
  DEFAULT_QUADRANT_WIDTH: 'calc(50%-8px)',
  DEFAULT_QUADRANT_HEIGHT: 'calc((100vw)/2-32px)',
  DEFAULT_QUADRANT_SM_HEIGHT: 'calc(100vh/2)',
  DEFAULT_QUADRANT_SM_HEIGHT_COLLAPSED: 'calc(100vh/2-64px)',
  COLLAPSED_QUADRANT_HEIGHT: 'calc(100vw/3-48px)',
  COLLAPSED_QUADRANT_WIDTH: 'calc((33.333%-8px))',
  EXPANDED_MAX_HEIGHT: 'calc(100dvh-200px)',
  MIN_HEIGHT: '40px',
} as const;

// Task count text styles
export const TASK_COUNT_STYLES = {
  DEFAULT:
    'text-foreground absolute top-0 left-1 z-0 text-7xl opacity-15 select-none sm:top-1 sm:left-6 sm:text-sm sm:opacity-50',
  EMPTY:
    'text-foreground absolute top-0 left-1 z-0 text-7xl opacity-15 select-none sm:top-1 sm:left-6 sm:text-sm sm:opacity-50 sm:!text-7xl sm:!opacity-25',
} as const;

// List styles
export const LIST_STYLES = {
  DEFAULT:
    'scrollbar-hidden relative z-2 list-none flex-col h-full overflow-x-hidden overflow-y-auto sm:flex',
  EXPANDED:
    'scrollbar-hidden relative z-2 list-none flex-col h-full overflow-x-hidden overflow-y-auto flex pb-8 sm:flex',
  COLLAPSED:
    'scrollbar-hidden relative z-2 list-none flex-col h-full overflow-x-hidden overflow-y-auto hidden sm:flex',
} as const;
