import { act, fireEvent, screen } from '@testing-library/react';
import { MatrixKey } from '@/shared/stores/tasksStore';

// Mouse drag in jsdom: a layout for dnd-kit to measure and a pointer to move

const CELL_SIZE = { width: 500, height: 400 };

// The 2×2 as it's laid out on a desktop: left to right, top to bottom
const CELL_ORIGINS: Record<MatrixKey, { x: number; y: number }> = {
  ImportantUrgent: { x: 0, y: 0 },
  ImportantNotUrgent: { x: 500, y: 0 },
  NotImportantUrgent: { x: 0, y: 400 },
  NotImportantNotUrgent: { x: 500, y: 400 },
};

export const list = (title: string) =>
  screen.getByRole('listbox', { name: title });
// The quadrant cell holds the title and the list's wrapper, which holds its
// scrolling area and the list
export const cell = (title: string) =>
  list(title).parentElement!.parentElement!.parentElement!;

/** The quadrant an element lies in: named by its list's `aria-labelledby` */
const quadrantOf = (el: Element): MatrixKey | undefined => {
  const lists = el.querySelectorAll('[role="listbox"]');
  const ownList =
    el.closest('[role="listbox"]') ?? (lists.length === 1 ? lists[0] : null);
  const labelledBy = ownList?.getAttribute('aria-labelledby');
  return (Object.keys(CELL_ORIGINS) as MatrixKey[]).find((key) =>
    labelledBy?.endsWith(`-${key}`),
  );
};

/**
 * jsdom doesn't lay out, so dnd-kit's closestCenter can't tell quadrants
 * apart. This gives each quadrant, and everything in it, the quadrant's box.
 */
export const mockQuadrantLayout = () =>
  jest
    .spyOn(Element.prototype, 'getBoundingClientRect')
    .mockImplementation(function (this: Element) {
      const key = quadrantOf(this);
      const { x, y } = key ? CELL_ORIGINS[key] : { x: 0, y: 0 };
      const { width, height } = key ? CELL_SIZE : { width: 0, height: 0 };
      return {
        x,
        y,
        left: x,
        top: y,
        width,
        height,
        right: x + width,
        bottom: y + height,
        toJSON: () => ({}),
      } as DOMRect;
    });

export const centerOf = (key: MatrixKey) => ({
  clientX: CELL_ORIGINS[key].x + CELL_SIZE.width / 2,
  clientY: CELL_ORIGINS[key].y + CELL_SIZE.height / 2,
});

/**
 * Presses the mouse on a task in the top-left quadrant and drags it over
 * another one, not dropping it. The drag overlay lies outside the quadrants,
 * so it measures as an empty box at the page's origin, and dnd-kit looks for
 * the target at the pointer's travel: the press is at the origin too.
 */
export const dragOver = async (text: string, to: MatrixKey) => {
  const card = screen.getByRole('option', { name: text });
  fireEvent.mouseDown(card, { clientX: 0, clientY: 0, button: 0 });
  await act(async () => {});
  // Past the 5 px activation distance, then over the target
  fireEvent.mouseMove(document, { clientX: 10, clientY: 0 });
  await act(async () => {});
  fireEvent.mouseMove(document, centerOf(to));
  await act(async () => {});
};
