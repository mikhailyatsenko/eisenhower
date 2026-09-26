'use client';

import { useEffect, useRef } from 'react';

// Height of the header with the sync bar. The phone grid's Tailwind classes
// (quadrant consts in entities/matrixLayout) spell the name out: rename both
const TOP_BARS_HEIGHT_VAR = '--top-bars-height';

/**
 * Sticks the header and the sync bar under it to the top of the page and
 * keeps their height, which grows while the bar shows, in a CSS variable.
 */
export const TopBars = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    // jsdom has no ResizeObserver
    if (!element || typeof ResizeObserver === 'undefined') return;
    const root = document.documentElement;
    const observer = new ResizeObserver(() => {
      root.style.setProperty(TOP_BARS_HEIGHT_VAR, `${element.offsetHeight}px`);
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
      root.style.removeProperty(TOP_BARS_HEIGHT_VAR);
    };
  }, []);

  return (
    <div ref={ref} className="sticky top-0 z-30">
      {children}
    </div>
  );
};
