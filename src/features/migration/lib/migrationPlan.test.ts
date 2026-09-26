import type { MatrixKey, Task, Tasks } from '@/shared/stores/tasksStore';
import { migrationPlan } from '.';

const CREATED = new Date('2026-09-20T10:00:00.000Z');

const task = (id: string): Task => ({ id, text: id, createdAt: CREATED });

const done = (id: string, completedAt: string, quadrantKey?: MatrixKey) => ({
  ...task(id),
  completed: true,
  completedAt: new Date(completedAt),
  quadrantKey,
});

const EMPTY: Tasks = {
  ImportantUrgent: [],
  ImportantNotUrgent: [],
  NotImportantUrgent: [],
  NotImportantNotUrgent: [],
};

const matrix = (
  quadrants: Partial<Record<MatrixKey, string[]>>,
  completedTasks: Task[] = [],
) => ({
  tasks: {
    ...EMPTY,
    ...Object.fromEntries(
      Object.entries(quadrants).map(([key, ids]) => [key, ids.map(task)]),
    ),
  },
  completedTasks,
});

/** What gets written: `quadrant:order id`, `completed quadrant:order id` */
const written = (
  device: ReturnType<typeof matrix>,
  cloud: ReturnType<typeof matrix>,
) => {
  const { decision, count, changes } = migrationPlan(device, cloud);
  return {
    decision,
    count,
    changes: changes.map((change) =>
      change.type === 'delete'
        ? `delete ${change.id}`
        : `${change.completed ? 'completed ' : ''}${change.quadrantKey}:${change.order} ${change.task.id}`,
    ),
  };
};

describe('migrationPlan', () => {
  it.each([
    {
      name: 'nothing on the device: nothing to do',
      device: matrix({}),
      cloud: matrix({ ImportantUrgent: ['c'] }),
      expected: { decision: 'none', count: 0, changes: [] },
    },
    {
      name: 'an empty cloud takes the tasks in the same order',
      device: matrix({
        ImportantUrgent: ['a', 'b'],
        NotImportantUrgent: ['x'],
      }),
      cloud: matrix({}),
      expected: {
        decision: 'move',
        count: 3,
        changes: [
          'ImportantUrgent:0 a',
          'ImportantUrgent:1 b',
          'NotImportantUrgent:0 x',
        ],
      },
    },
    {
      name: 'a cloud with its own tasks asks, adding after them',
      device: matrix({ ImportantUrgent: ['a', 'b'] }),
      cloud: matrix({ ImportantUrgent: ['c'], ImportantNotUrgent: ['d'] }),
      expected: {
        decision: 'ask',
        count: 2,
        changes: ['ImportantUrgent:1 a', 'ImportantUrgent:2 b'],
      },
    },
    {
      name: 'every device task already in the cloud: nothing to write',
      device: matrix({ ImportantUrgent: ['a', 'b'] }, [
        done('z', '2026-09-21T10:00:00Z'),
      ]),
      cloud: matrix({ ImportantUrgent: ['a', 'b'] }, [
        done('z', '2026-09-21T10:00:00Z'),
      ]),
      expected: { decision: 'none', count: 0, changes: [] },
    },
    {
      name: 'a cut-short move: the cloud holds only device tasks, the rest move',
      device: matrix({ ImportantUrgent: ['a', 'b', 'c'] }),
      cloud: matrix({ ImportantUrgent: ['a'] }),
      expected: {
        decision: 'move',
        count: 2,
        changes: ['ImportantUrgent:1 b', 'ImportantUrgent:2 c'],
      },
    },
    {
      name: 'part already in a cloud with its own tasks: asks about the rest',
      device: matrix({ ImportantUrgent: ['a', 'b'] }),
      cloud: matrix({ ImportantUrgent: ['c', 'a'] }),
      expected: {
        decision: 'ask',
        count: 1,
        changes: ['ImportantUrgent:2 b'],
      },
    },
    {
      name: 'only Completed moves too, in its original quadrant',
      device: matrix({}, [
        done('old', '2026-09-20T10:00:00Z', 'ImportantNotUrgent'),
        done('new', '2026-09-22T10:00:00Z'),
      ]),
      cloud: matrix({}),
      expected: {
        decision: 'move',
        count: 2,
        changes: [
          'completed NotImportantNotUrgent:0 new',
          'completed ImportantNotUrgent:1 old',
        ],
      },
    },
    {
      name: 'Completed joins the cloud’s by completion time',
      device: matrix({}, [
        done('d1', '2026-09-20T10:00:00Z'),
        done('d3', '2026-09-24T10:00:00Z'),
      ]),
      cloud: matrix({}, [
        done('c2', '2026-09-22T10:00:00Z'),
        done('c0', '2026-09-19T10:00:00Z'),
      ]),
      expected: {
        decision: 'ask',
        count: 2,
        changes: [
          'completed NotImportantNotUrgent:0 d3',
          'completed NotImportantNotUrgent:2 d1',
        ],
      },
    },
  ])('$name', ({ device, cloud, expected }) => {
    expect(written(device, cloud)).toEqual(expected);
  });

  it('writes the tasks with the same id, text, dates and completion', () => {
    const due = new Date('2026-10-01T09:00:00Z');
    const completed = done('z', '2026-09-21T10:00:00Z', 'ImportantUrgent');
    const { changes } = migrationPlan(
      {
        tasks: {
          ...EMPTY,
          ImportantNotUrgent: [{ ...task('a'), dueDate: due }],
        },
        completedTasks: [completed],
      },
      matrix({}),
    );

    expect(changes).toEqual([
      {
        type: 'set',
        task: { ...task('a'), dueDate: due },
        quadrantKey: 'ImportantNotUrgent',
        order: 0,
        completed: false,
      },
      {
        type: 'set',
        task: completed,
        quadrantKey: 'ImportantUrgent',
        order: 0,
        completed: true,
      },
    ]);
  });
});
