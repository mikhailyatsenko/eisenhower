import { Task, Tasks } from '../types';
import { getEmptyTasksState, reorderedQuadrants } from '.';

const CREATED = new Date('2026-09-20T10:00:00.000Z');

const stored = (ids: string[]): Task[] =>
  ids.map((id, order) => ({ id, text: id, createdAt: CREATED, order }));

const matrix = (quadrants: Partial<Tasks>): Tasks => ({
  ...getEmptyTasksState(),
  ...quadrants,
});

describe('reorderedQuadrants', () => {
  it.each([
    {
      name: 'nothing moved',
      after: { ImportantUrgent: ['a', 'b'], ImportantNotUrgent: ['c'] },
      expected: [],
    },
    {
      name: 'a reorder within one quadrant',
      after: { ImportantUrgent: ['b', 'a'], ImportantNotUrgent: ['c'] },
      expected: ['ImportantUrgent'],
    },
    {
      name: 'a task that left one quadrant for another',
      after: { ImportantUrgent: ['a'], ImportantNotUrgent: ['c', 'b'] },
      expected: ['ImportantUrgent', 'ImportantNotUrgent'],
    },
  ])('$name', ({ after, expected }) => {
    const before = matrix({
      ImportantUrgent: stored(['a', 'b']),
      ImportantNotUrgent: stored(['c']),
    });
    const afterTasks = matrix({
      ImportantUrgent: stored(after.ImportantUrgent),
      ImportantNotUrgent: stored(after.ImportantNotUrgent),
    });

    expect(reorderedQuadrants(before, afterTasks)).toEqual(expected);
  });
});
