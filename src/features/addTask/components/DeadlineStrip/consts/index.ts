/**
 * The strip stands where the action panel does: one row at the bottom centre
 * on desktop, full width on a phone
 */
export const STRIP_STYLES = {
  DESKTOP:
    'fixed bottom-4 left-1/2 z-40 flex w-max max-w-[calc(100%-2rem)] -translate-x-1/2 flex-wrap items-center justify-center gap-2 rounded-xl bg-gray-900 p-1.5 pl-3 text-sm text-white shadow-2xl dark:bg-gray-800',
  PHONE:
    'fixed inset-x-0 bottom-0 z-40 rounded-t-2xl bg-gray-900 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] text-sm text-white shadow-2xl dark:bg-gray-800',
  LABEL: 'px-1 text-xs font-bold tracking-wider text-gray-300 uppercase',
  // A phone's folded strip: its title unfolds the chips and the date
  FOLD_BUTTON:
    'flex min-h-11 min-w-0 cursor-pointer items-center gap-1 rounded-lg px-1 text-left text-xs text-gray-200 hover:bg-white/10',
  // Every target is at least 44×44 on a phone
  ADD_BUTTON:
    'flex min-h-11 shrink-0 cursor-pointer items-center rounded-lg bg-indigo-700 px-3 text-xs font-bold whitespace-nowrap text-white hover:bg-indigo-800 disabled:cursor-default disabled:opacity-40 disabled:hover:bg-indigo-700 sm:min-h-9',
} as const;
