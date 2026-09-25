import {
  RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';

import { tasksBelow } from '../lib';

/**
 * How many tasks of the scrolling area aren't fully visible below its edge.
 * Recounts after every render (tasks added, removed or edited), on resize and
 * on the `recount` it returns, which the area calls on scroll.
 */
export const useTasksBelowCount = (
  scrollAreaRef: RefObject<HTMLElement | null>,
) => {
  const [count, setCount] = useState(0);

  const recount = useCallback(() => {
    if (scrollAreaRef.current) {
      setCount(tasksBelow(scrollAreaRef.current).length);
    }
  }, [scrollAreaRef]);

  useLayoutEffect(recount);

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    // jsdom has no ResizeObserver
    if (!scrollArea || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(recount);
    observer.observe(scrollArea);
    return () => observer.disconnect();
  }, [scrollAreaRef, recount]);

  return { count, recount };
};
