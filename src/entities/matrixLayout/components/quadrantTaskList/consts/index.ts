// The wrapper holds the list and its "+N below". On a phone only the expanded
// quadrant shows its list; its Collapse bar covers the bottom 2rem.
export const LIST_STYLES = {
  WRAPPER_EXPANDED: 'relative z-2 h-full',
  WRAPPER_COLLAPSED: 'relative z-2 hidden h-full sm:block',
  LIST: 'relative flex h-full list-none flex-col overflow-x-hidden overflow-y-auto px-1',
  LIST_EXPANDED: 'pb-8',
  MORE_BELOW_EXPANDED: 'bottom-9',
} as const;
