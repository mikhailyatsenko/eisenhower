import { MatrixKey } from '@/shared/stores/tasksStore';
import { HEADER_FOCUS_RING } from '../../../consts';

export const SECTION_HEADER_STYLES = {
  // Sticks under the header and the sync bar; the next section's header
  // pushes it out, as each sticks within its own section
  HEADER:
    'sticky top-[var(--top-bars-height,56px)] z-10 flex items-center gap-1 bg-background/95 py-1 backdrop-blur-sm',
  HEADING: 'min-w-0 flex-1',
  // 44px tall on every width
  TOGGLE: `flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-md px-1 text-left hover:bg-black/5 dark:hover:bg-white/5 ${HEADER_FOCUS_RING}`,
  // An empty section has no toggle: the same row, without the button
  STATIC: 'flex min-h-11 items-center gap-2 px-1',
  TITLE: 'shrink-0 text-base font-bold',
  // Above 4.5:1 on the page in both themes
  CRITERIA: 'min-w-0 truncate text-sm text-gray-600 dark:text-gray-400',
  COUNT: 'shrink-0 text-sm text-gray-600 dark:text-gray-400',
  CHEVRON:
    'ml-auto shrink-0 px-1 text-base text-gray-600 transition-transform motion-reduce:transition-none dark:text-gray-400',
} as const;

// The quadrant's colour in the title, above 4.5:1 on the page in both themes
export const SECTION_TITLE_COLOR: Record<MatrixKey, string> = {
  ImportantUrgent: 'text-red-700 dark:text-red-300',
  ImportantNotUrgent: 'text-yellow-800 dark:text-yellow-300',
  NotImportantUrgent: 'text-blue-700 dark:text-blue-300',
  NotImportantNotUrgent: 'text-green-800 dark:text-green-300',
};
