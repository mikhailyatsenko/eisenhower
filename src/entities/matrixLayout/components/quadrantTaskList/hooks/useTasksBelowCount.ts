import {
  RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';

import { tasksBelow } from '../lib';

/**
 * How many tasks of the list aren't fully visible below its edge. Recounts
 * after every render (tasks added, removed or edited), on resize and on the
 * `recount` it returns, which the list calls on scroll.
 */
export const useTasksBelowCount = (listRef: RefObject<HTMLElement | null>) => {
  const [count, setCount] = useState(0);

  const recount = useCallback(() => {
    if (listRef.current) setCount(tasksBelow(listRef.current).length);
  }, [listRef]);

  useLayoutEffect(recount);

  useEffect(() => {
    const list = listRef.current;
    // jsdom has no ResizeObserver
    if (!list || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(recount);
    observer.observe(list);
    return () => observer.disconnect();
  }, [listRef, recount]);

  return { count, recount };
};
