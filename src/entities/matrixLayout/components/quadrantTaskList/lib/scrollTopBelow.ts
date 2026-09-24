import { tasksBelow } from './tasksBelow';

/**
 * Where to scroll the list to show what's below: the first task that doesn't
 * fit goes to the top. A task taller than the list scrolls it by a page.
 */
export const scrollTopBelow = (list: HTMLElement) => {
  const [next] = tasksBelow(list);

  return next && next.offsetTop > list.scrollTop
    ? next.offsetTop
    : list.scrollTop + list.clientHeight;
};
