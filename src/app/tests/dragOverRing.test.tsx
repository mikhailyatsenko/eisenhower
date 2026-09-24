import { act, fireEvent, screen } from '@testing-library/react';
import { MatrixKey } from '@/shared/stores/tasksStore';
import { renderHomePage } from './renderHomePage';

// Whole-page flows run past the default 5 s on a cold pre-commit run
jest.setTimeout(20_000);

const TASKS = {
  ImportantUrgent: ['Alpha'],
  ImportantNotUrgent: ['Delta'],
  NotImportantUrgent: ['Echo'],
  NotImportantNotUrgent: ['Golf'],
};

const CELL_SIZE = { width: 500, height: 400 };

// The 2×2 as it's laid out on a desktop: left to right, top to bottom
const CELL_ORIGINS: Record<MatrixKey, { x: number; y: number }> = {
  ImportantUrgent: { x: 0, y: 0 },
  ImportantNotUrgent: { x: 500, y: 0 },
  NotImportantUrgent: { x: 0, y: 400 },
  NotImportantNotUrgent: { x: 500, y: 400 },
};

const list = (title: string) => screen.getByRole('listbox', { name: title });
// The quadrant cell holds the list's scroll wrapper, the list and the title
const cell = (title: string) => list(title).parentElement!.parentElement!;

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
const mockQuadrantLayout = () =>
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

const centerOf = (key: MatrixKey) => ({
  clientX: CELL_ORIGINS[key].x + CELL_SIZE.width / 2,
  clientY: CELL_ORIGINS[key].y + CELL_SIZE.height / 2,
});

/**
 * Presses the mouse on a task in the top-left quadrant and drags it over
 * another one, not dropping it. The drag overlay lies outside the quadrants,
 * so it measures as an empty box at the page's origin, and dnd-kit looks for
 * the target at the pointer's travel: the press is at the origin too.
 */
const dragOver = async (text: string, to: MatrixKey) => {
  const card = screen.getByRole('option', { name: text });
  fireEvent.mouseDown(card, { clientX: 0, clientY: 0, button: 0 });
  await act(async () => {});
  // Past the 5 px activation distance, then over the target
  fireEvent.mouseMove(document, { clientX: 10, clientY: 0 });
  await act(async () => {});
  fireEvent.mouseMove(document, centerOf(to));
  await act(async () => {});
};

const classesLike = (el: Element, pattern: RegExp) =>
  Array.from(el.classList).filter((name) => pattern.test(name));
const ringClasses = (el: Element) => classesLike(el, /(^|:)ring-/);
const backgroundClasses = (el: Element) => classesLike(el, /(^|[:!])bg-/);
/** Ring colours of a cell, light and dark, e.g. `yellow` for Schedule */
const ringColours = (el: Element) =>
  ringClasses(el).flatMap(
    (name) => name.match(/ring-([a-z]+)-\d+$/)?.[1] ?? [],
  );

let layoutSpy: jest.SpyInstance;

beforeEach(() => {
  layoutSpy = mockQuadrantLayout();
});

afterEach(() => {
  layoutSpy.mockRestore();
});

describe('Quadrant under a dragged task', () => {
  it('gets a ring in its own colour instead of a grey fill', async () => {
    await renderHomePage({ tasks: TASKS });

    await dragOver('Alpha', 'ImportantNotUrgent');

    const target = cell('Schedule');
    expect(target).toHaveClass('ring-4');
    expect(ringColours(target)).toEqual(['yellow', 'yellow']);
    expect(ringClasses(target)).toContainEqual(
      expect.stringMatching(/^dark:ring-yellow-/),
    );
    expect(target).not.toHaveClass('!bg-gray-400');
  });

  it('keeps the quadrant background, so its tasks stay readable', async () => {
    await renderHomePage({ tasks: TASKS });
    const background = backgroundClasses(cell('Schedule'));

    await dragOver('Alpha', 'ImportantNotUrgent');

    expect(backgroundClasses(cell('Schedule'))).toEqual(background);
  });

  it('moves the ring with the pointer and rings no other quadrant', async () => {
    await renderHomePage({ tasks: TASKS });

    await dragOver('Alpha', 'NotImportantUrgent');

    expect(ringColours(cell('Delegate'))).toContain('blue');
    for (const title of ['Do First', 'Schedule', 'Eliminate']) {
      expect(ringClasses(cell(title))).toEqual([]);
    }
  });

  it('drops the ring when the drag ends', async () => {
    await renderHomePage({ tasks: TASKS });

    await dragOver('Alpha', 'NotImportantNotUrgent');
    expect(ringColours(cell('Eliminate'))).toContain('green');

    fireEvent.mouseUp(document, centerOf('NotImportantNotUrgent'));
    await act(async () => {});

    for (const title of ['Do First', 'Schedule', 'Delegate', 'Eliminate']) {
      expect(ringClasses(cell(title))).toEqual([]);
    }
    expect(list('Eliminate')).toHaveTextContent('Alpha');
  });
});
