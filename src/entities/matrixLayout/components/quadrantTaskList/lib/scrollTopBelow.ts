import { tasksBelow } from './tasksBelow';

/**
 * Where to scroll the area to show what's below: the first task that doesn't
 * fit goes to the top. A task taller than the area scrolls it by a page.
 */
export const scrollTopBelow = (scrollArea: HTMLElement) => {
  const [next] = tasksBelow(scrollArea);

  return next && next.offsetTop > scrollArea.scrollTop
    ? next.offsetTop
    : scrollArea.scrollTop + scrollArea.clientHeight;
};
