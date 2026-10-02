/**
 * The strip stands where the action panel does: one row at the bottom centre
 * on desktop, full width on a phone
 */
export const STRIP_STYLES = {
  DESKTOP:
    'fixed bottom-4 left-1/2 z-40 flex w-max max-w-[calc(100%-2rem)] -translate-x-1/2 flex-wrap items-center justify-center gap-2 rounded-xl bg-gray-900 p-1.5 pl-3 text-sm text-white shadow-2xl dark:bg-gray-800',
  PHONE:
    'fixed inset-x-0 bottom-0 z-40 rounded-t-2xl bg-gray-900 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-sm text-white shadow-2xl dark:bg-gray-800',
  // A phone's folded strip: its title unfolds the chips and the date
  FOLD_BUTTON:
    'flex min-h-11 min-w-0 cursor-pointer items-center gap-1 rounded-lg px-1 text-left text-xs text-gray-200 hover:bg-white/10',
  // Desktop's ×: first, in place of a "Deadline" label, away from Add. A red
  // cross, no fill: it drops what's typed; red-400 on the strip's
  // gray-900/800 is above 3:1.
  // A phone's ×: a round badge half over the strip's top left corner, 32px
  // to see, 44×44 to tap. A solid ring: half of it lies over the page, half
  // over the strip, and a see-through one shows the two apart.
  CANCEL_BADGE:
    'absolute -top-4 left-3 flex size-8 cursor-pointer items-center justify-center rounded-full bg-gray-900 text-red-400 shadow-lg ring-1 ring-gray-600 before:absolute before:-inset-1.5 dark:bg-gray-800',
  CANCEL_BUTTON:
    'flex min-h-11 min-w-11 shrink-0 cursor-pointer items-center justify-center rounded-lg text-red-400 hover:bg-white/10 sm:min-h-9 sm:min-w-9',
  // Every target is at least 44×44 on a phone
  ADD_BUTTON:
    'flex min-h-11 shrink-0 cursor-pointer items-center rounded-lg bg-indigo-700 px-3 text-xs font-bold whitespace-nowrap text-white hover:bg-indigo-800 disabled:cursor-default disabled:opacity-40 disabled:hover:bg-indigo-700 sm:min-h-9',
} as const;
