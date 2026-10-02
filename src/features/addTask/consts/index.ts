import { MatrixKey } from '@/shared/stores/tasksStore';

// The field's dashed frame, solid while focused: 700 on the 200 fill of the
// quadrant, 400 on the dark one, all above 3:1
export const FIELD_BORDER: Record<MatrixKey, string> = {
  ImportantUrgent: 'border-red-700 dark:border-red-400',
  ImportantNotUrgent: 'border-yellow-700 dark:border-yellow-400',
  NotImportantUrgent: 'border-blue-700 dark:border-blue-400',
  NotImportantNotUrgent: 'border-green-700 dark:border-green-400',
};

// One focus indicator: the frame turns solid, the browser outline is off
export const FIELD_STYLES =
  'mb-2 block w-full shrink-0 rounded-md border-2 border-dashed bg-white/60 px-2 py-1.5 text-sm text-gray-900 outline-none placeholder:text-gray-700 focus:border-solid sm:py-2 sm:text-base dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-300';

// Out of the Tab order, so only a pointer target: 44px tall on a phone, 24px
// on wider screens, where it sits in the header line without making it
// taller. The frame: 700 on the quadrant's 200 fill and on the page, 400 on
// the dark ones, all above 3:1.
export const ADD_BUTTON_STYLES =
  'flex h-11 shrink-0 cursor-pointer items-center gap-0.5 self-center rounded-full border border-gray-700 px-2.5 text-xs font-semibold text-gray-900 outline-hidden hover:bg-black/10 focus-visible:outline-2 focus-visible:outline-indigo-700 sm:-my-1 sm:h-6 dark:border-gray-400 dark:text-gray-100 dark:hover:bg-white/10 dark:focus-visible:outline-indigo-300';
