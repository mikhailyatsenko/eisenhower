/** Where Tab from the add field enters the strip: the chip pressed, else the date */
export const stripEntry = (strip: HTMLElement | null) =>
  strip?.querySelector<HTMLElement>('button[aria-pressed="true"]') ??
  strip?.querySelector<HTMLElement>('input');

/** The strip's first element in the Tab order: Shift+Tab from it goes back to the field */
export const stripFirstFocusable = (strip: HTMLElement | null) =>
  strip?.querySelector<HTMLElement>('button:enabled, input');
