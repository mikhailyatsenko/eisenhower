import { act, fireEvent } from '@testing-library/react';
import { cell, centerOf, dragOver, list, mockQuadrantLayout } from './drag';
import { renderHomePage } from './renderHomePage';

// Whole-page flows run past the default 5 s on a cold pre-commit run
jest.setTimeout(20_000);

const TASKS = {
  ImportantUrgent: ['Alpha'],
  ImportantNotUrgent: ['Delta'],
  NotImportantUrgent: ['Echo'],
  NotImportantNotUrgent: ['Golf'],
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
