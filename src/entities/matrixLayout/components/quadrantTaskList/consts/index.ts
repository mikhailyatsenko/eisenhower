// The wrapper holds the scrolling area and its "+N below" and takes the
// quadrant's height under its header. The area scrolls the list and what
// comes after it (the inline add field): the list itself holds tasks only.
export const LIST_STYLES = {
  WRAPPER: 'relative z-2 min-h-0 flex-1',
  SCROLL_AREA: 'relative h-full overflow-x-hidden overflow-y-auto px-1',
  // The gaps between cards are empty space too: a click there adds a task
  LIST: 'flex list-none flex-col gap-2 py-2',
} as const;
