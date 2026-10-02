import { RefObject, useLayoutEffect, useState } from 'react';

// Between the field and the strip once it's scrolled clear, past the ×
// badge over a phone strip's top edge too
const GAP_PX = 24;

/**
 * Keeps the inline add field above the deadline strip, which covers the
 * bottom of the screen (on a phone, over the keyboard too). In the matrix
 * the quadrant's list gets room to scroll under the strip: the height to
 * give a spacer after the field. The field is scrolled clear on each open
 * and add, and as the strip or the keyboard moves.
 */
export const useClearOfStrip = (
  inputRef: RefObject<HTMLElement | null>,
  stripRef: RefObject<HTMLElement | null>,
  scrollsPage: boolean,
  /** The field and the strip are on the page */
  isOpen: boolean,
  /** An open or an add: the field has moved */
  moves: unknown[],
) => {
  const [room, setRoom] = useState(0);
  const [layoutCount, setLayoutCount] = useState(0);

  // The strip grows with "+ Time", the keyboard lifts it on a phone
  useLayoutEffect(() => {
    const strip = stripRef.current;
    const relayout = () => setLayoutCount((count) => count + 1);
    const observer =
      typeof ResizeObserver === 'undefined' || !strip
        ? null
        : new ResizeObserver(relayout);
    if (strip) observer?.observe(strip);
    window.visualViewport?.addEventListener('resize', relayout);
    window.addEventListener('resize', relayout);
    return () => {
      observer?.disconnect();
      window.visualViewport?.removeEventListener('resize', relayout);
      window.removeEventListener('resize', relayout);
    };
  }, [stripRef, isOpen]);

  useLayoutEffect(() => {
    const input = inputRef.current;
    const stripRect = stripRef.current?.getBoundingClientRect();
    // Nothing laid out, as in jsdom
    if (!input || !stripRect?.height) return;
    const area = input.parentElement;

    if (!scrollsPage && area) {
      const covered = Math.max(
        0,
        Math.ceil(area.getBoundingClientRect().bottom - stripRect.top),
      );
      if (covered !== room) {
        setRoom(covered);
        return;
      }
    }
    const overlap = Math.ceil(
      input.getBoundingClientRect().bottom + GAP_PX - stripRect.top,
    );
    if (overlap <= 0) return;
    if (scrollsPage) window.scrollBy(0, overlap);
    else if (area) area.scrollTop += overlap;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...moves, room, layoutCount, scrollsPage]);

  return room;
};
