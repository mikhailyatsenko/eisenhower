import { MatrixKey, Task, Tasks } from '../types';
import { actionChanges, getEmptyTasksState } from '.';

const CREATED = new Date('2026-09-20T10:00:00.000Z');

/** Tasks as a snapshot gives them: `order` is what the server holds */
const stored = (ids: string[], orders?: (number | undefined)[]): Task[] =>
  ids.map((id, index) => ({
    id,
    text: id,
    createdAt: CREATED,
    order: orders ? orders[index] : index,
  }));

const matrix = (quadrants: Partial<Tasks>): Tasks => ({
  ...getEmptyTasksState(),
  ...quadrants,
});

const fresh = (id: string): Task => ({ id, text: id, createdAt: CREATED });

/** What gets written: `quadrant:order id` per change, `-id` for completed */
const written = (
  tasks: Tasks,
  completedTasks: Task[],
  changedIds: string[],
  areas: (MatrixKey | 'completed')[],
) =>
  actionChanges({ tasks, completedTasks }, changedIds, areas).map((change) =>
    change.type === 'delete'
      ? `delete ${change.id}`
      : `${change.completed ? 'completed ' : ''}${change.quadrantKey}:${change.order} ${change.task.id}`,
  );

describe('actionChanges', () => {
  it.each([
    {
      name: 'an edit writes only the edited task',
      tasks: matrix({ ImportantUrgent: stored(['a', 'b', 'c']) }),
      completed: [],
      changedIds: ['b'],
      areas: ['ImportantUrgent'] as const,
      expected: ['ImportantUrgent:1 b'],
    },
    {
      name: 'a task added at the end writes only itself',
      tasks: matrix({
        ImportantUrgent: [...stored(['a', 'b']), fresh('new')],
      }),
      completed: [],
      changedIds: ['new'],
      areas: ['ImportantUrgent'] as const,
      expected: ['ImportantUrgent:2 new'],
    },
    {
      name: 'a task added on top moves the order of the rest',
      tasks: matrix({
        ImportantUrgent: [fresh('new'), ...stored(['a', 'b'])],
      }),
      completed: [],
      changedIds: ['new'],
      areas: ['ImportantUrgent'] as const,
      expected: [
        'ImportantUrgent:0 new',
        'ImportantUrgent:1 a',
        'ImportantUrgent:2 b',
      ],
    },
    {
      name: 'a move writes the task and the order it left behind, not other quadrants',
      tasks: matrix({
        ImportantUrgent: stored(['a', 'c'], [0, 2]),
        ImportantNotUrgent: stored(['x', 'y'], [5, 5]),
        NotImportantNotUrgent: [...stored(['z']), { ...fresh('b'), order: 1 }],
      }),
      completed: [],
      changedIds: ['b'],
      areas: ['ImportantUrgent', 'NotImportantNotUrgent'] as const,
      expected: ['ImportantUrgent:1 c', 'NotImportantNotUrgent:1 b'],
    },
    {
      name: 'a task without a stored order gets one',
      tasks: matrix({ ImportantUrgent: stored(['a', 'b'], [0, undefined]) }),
      completed: [],
      changedIds: [],
      areas: ['ImportantUrgent'] as const,
      expected: ['ImportantUrgent:1 b'],
    },
    {
      name: 'Completed writes only the changed task: it is shown by completion time, not order',
      tasks: matrix({}),
      completed: [
        ...stored(['newer', 'older'], [3, 7]),
        { ...fresh('a'), completed: true },
      ],
      changedIds: ['a'],
      areas: ['completed'] as const,
      expected: ['completed NotImportantNotUrgent:2 a'],
    },
    {
      name: 'a completed task is written as completed, in its original quadrant',
      tasks: matrix({ ImportantUrgent: stored(['b'], [1]) }),
      completed: [
        ...stored(['old']),
        {
          ...fresh('a'),
          completed: true,
          quadrantKey: 'ImportantUrgent' as const,
        },
      ],
      changedIds: ['a'],
      areas: ['ImportantUrgent', 'completed'] as const,
      expected: ['ImportantUrgent:0 b', 'completed ImportantUrgent:1 a'],
    },
    {
      name: 'a completed task without a quadrant goes to the restore fallback',
      tasks: matrix({}),
      completed: [fresh('a')],
      changedIds: ['a'],
      areas: ['completed'] as const,
      expected: ['completed NotImportantNotUrgent:0 a'],
    },
  ])('$name', ({ tasks, completed, changedIds, areas, expected }) => {
    expect(written(tasks, completed, changedIds, [...areas])).toEqual(expected);
  });

  it('writes the task with its quadrant and completion', () => {
    const [change] = actionChanges(
      { tasks: matrix({ ImportantUrgent: [fresh('a')] }), completedTasks: [] },
      ['a'],
      ['ImportantUrgent'],
    );

    expect(change).toEqual({
      type: 'set',
      task: fresh('a'),
      quadrantKey: 'ImportantUrgent',
      order: 0,
      completed: false,
    });
  });
});
