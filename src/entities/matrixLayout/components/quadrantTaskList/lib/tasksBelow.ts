// Sub-pixel rounding shouldn't hide a task that sits flush with the edge
const TOLERANCE_PX = 2;

/**
 * Tasks in a scrolling area that aren't fully visible below its bottom edge.
 * The area is their offset parent, so `offsetTop` counts from its top.
 */
export const tasksBelow = (scrollArea: HTMLElement): HTMLElement[] => {
  const bottom = scrollArea.scrollTop + scrollArea.clientHeight;

  return Array.from(
    scrollArea.querySelectorAll<HTMLElement>('[role="option"]'),
  ).filter(
    (item) => item.offsetTop + item.offsetHeight > bottom + TOLERANCE_PX,
  );
};
