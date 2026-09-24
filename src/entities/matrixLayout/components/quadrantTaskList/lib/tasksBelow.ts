// Sub-pixel rounding shouldn't hide a task that sits flush with the edge
const TOLERANCE_PX = 2;

/** Tasks of a scrolled list that aren't fully visible below its bottom edge */
export const tasksBelow = (list: HTMLElement): HTMLElement[] => {
  const bottom = list.scrollTop + list.clientHeight;

  return Array.from(list.children).filter(
    (item): item is HTMLElement =>
      item instanceof HTMLElement &&
      item.getAttribute('role') === 'option' &&
      item.offsetTop + item.offsetHeight > bottom + TOLERANCE_PX,
  );
};
