/**
 * Scrolls the element's scrolling parent, and nothing above it, just enough
 * to show the element whole. The parent is its offset parent.
 */
export const scrollIntoArea = (element: HTMLElement) => {
  const area = element.parentElement;
  if (!area) return;
  const top = element.offsetTop;
  const bottom = top + element.offsetHeight;

  if (bottom > area.scrollTop + area.clientHeight) {
    area.scrollTop = bottom - area.clientHeight;
  } else if (top < area.scrollTop) {
    area.scrollTop = top;
  }
};
