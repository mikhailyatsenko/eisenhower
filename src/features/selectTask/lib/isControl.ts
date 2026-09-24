/** Enter and Space belong to the focused control, not to the matrix */
export const isControl = (target: EventTarget | null) =>
  target instanceof Element &&
  target.closest('button, a[href], select, summary, [role="button"]') !== null;
