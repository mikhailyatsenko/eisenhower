'use client';

import { RefObject, useLayoutEffect } from 'react';
import { TOAST_BOTTOM_VAR, TOAST_CLEARANCE_GAP_PX } from '../consts';

/**
 * Lifts the toast right above an element pinned to the bottom of the
 * viewport, such as an action panel, for as long as the element is mounted.
 */
export const useToastClearance = (ref: RefObject<HTMLElement | null>) => {
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const root = document.documentElement;

    const update = () => {
      const { top } = element.getBoundingClientRect();
      const bottom = window.innerHeight - top + TOAST_CLEARANCE_GAP_PX;
      root.style.setProperty(TOAST_BOTTOM_VAR, `${bottom}px`);
    };

    update();
    // jsdom has no ResizeObserver
    const observer =
      typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
    observer?.observe(element);
    window.addEventListener('resize', update);

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', update);
      root.style.removeProperty(TOAST_BOTTOM_VAR);
    };
  }, [ref]);
};
