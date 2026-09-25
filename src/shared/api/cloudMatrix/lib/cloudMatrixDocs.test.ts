import { FirestoreTaskData } from '../types';
import { taskToDocData, toCloudSnapshot } from '.';

const CREATED = '2026-09-20T10:00:00.000Z';
const DUE = '2026-09-30T10:00:00.000Z';
const DONE_EARLIER = '2026-09-21T10:00:00.000Z';
const DONE_LATER = '2026-09-22T10:00:00.000Z';

const activeDoc = (
  id: string,
  data: Partial<FirestoreTaskData> = {},
): { id: string; data: FirestoreTaskData } => ({
  id,
  data: {
    id,
    text: id,
    createdAt: CREATED,
    quadrantKey: 'ImportantUrgent',
    userId: 'u1',
    order: 0,
    completed: false,
    ...data,
  },
});

const metadata = { fromCache: false, hasPendingWrites: false };

describe('toCloudSnapshot', () => {
  it.each([
    {
      name: 'puts active tasks in their quadrant by order',
      docs: [
        activeDoc('b', { order: 1 }),
        activeDoc('a', { order: 0 }),
        activeDoc('c', { quadrantKey: 'NotImportantUrgent', order: 0 }),
      ],
      quadrants: {
        ImportantUrgent: ['a', 'b'],
        ImportantNotUrgent: [],
        NotImportantUrgent: ['c'],
        NotImportantNotUrgent: [],
      },
      completed: [],
    },
    {
      name: 'puts completed tasks in Completed, newest first',
      docs: [
        activeDoc('old', { completed: true, completedAt: DONE_EARLIER }),
        activeDoc('new', { completed: true, completedAt: DONE_LATER }),
      ],
      quadrants: {
        ImportantUrgent: [],
        ImportantNotUrgent: [],
        NotImportantUrgent: [],
        NotImportantNotUrgent: [],
      },
      completed: ['new', 'old'],
    },
    {
      name: 'skips an active task without a quadrant',
      docs: [activeDoc('lost', { quadrantKey: undefined })],
      quadrants: {
        ImportantUrgent: [],
        ImportantNotUrgent: [],
        NotImportantUrgent: [],
        NotImportantNotUrgent: [],
      },
      completed: [],
    },
  ])('$name', ({ docs, quadrants, completed }) => {
    const snapshot = toCloudSnapshot(docs, metadata);

    const ids = Object.fromEntries(
      Object.entries(snapshot.tasks).map(([key, tasks]) => [
        key,
        tasks.map(({ id }) => id),
      ]),
    );
    expect(ids).toEqual(quadrants);
    expect(snapshot.completedTasks.map(({ id }) => id)).toEqual(completed);
  });

  it('turns stored strings back into dates and drops an empty deadline', () => {
    const snapshot = toCloudSnapshot(
      [
        activeDoc('due', { dueDate: DUE }),
        activeDoc('none', { order: 1, dueDate: null as unknown as undefined }),
        activeDoc('done', { completed: true, completedAt: DONE_LATER }),
      ],
      metadata,
    );

    const [due, none] = snapshot.tasks.ImportantUrgent;
    expect(due.createdAt).toEqual(new Date(CREATED));
    expect(due.dueDate).toEqual(new Date(DUE));
    expect(none.dueDate).toBeUndefined();
    expect(snapshot.completedTasks[0].completedAt).toEqual(
      new Date(DONE_LATER),
    );
    expect(snapshot.completedTasks[0].quadrantKey).toBe('ImportantUrgent');
  });

  it('passes on where the data came from', () => {
    const snapshot = toCloudSnapshot([], {
      fromCache: true,
      hasPendingWrites: true,
    });

    expect(snapshot).toMatchObject({ fromCache: true, hasPendingWrites: true });
  });
});

describe('taskToDocData', () => {
  const task = {
    id: 't1',
    text: 'Pay rent',
    createdAt: new Date(CREATED),
  };

  it.each([
    {
      name: 'an active task without a deadline',
      change: {
        task,
        quadrantKey: 'ImportantUrgent',
        order: 2,
        completed: false,
      },
      data: {
        text: 'Pay rent',
        quadrantKey: 'ImportantUrgent',
        userId: 'u1',
        createdAt: CREATED,
        dueDate: null,
        order: 2,
        completed: false,
      },
    },
    {
      name: 'an active task with a deadline',
      change: {
        task: { ...task, dueDate: new Date(DUE) },
        quadrantKey: 'NotImportantUrgent',
        order: 0,
        completed: false,
      },
      data: {
        text: 'Pay rent',
        quadrantKey: 'NotImportantUrgent',
        userId: 'u1',
        createdAt: CREATED,
        dueDate: DUE,
        order: 0,
        completed: false,
      },
    },
    {
      name: 'a completed task',
      change: {
        task: { ...task, completedAt: new Date(DONE_LATER) },
        quadrantKey: 'ImportantNotUrgent',
        order: 1,
        completed: true,
      },
      data: {
        text: 'Pay rent',
        quadrantKey: 'ImportantNotUrgent',
        userId: 'u1',
        createdAt: CREATED,
        dueDate: null,
        order: 1,
        completed: true,
        completedAt: DONE_LATER,
      },
    },
  ] as const)('$name', ({ change, data }) => {
    expect(taskToDocData({ type: 'set', ...change }, 'u1')).toEqual(data);
  });

  it('round-trips through toCloudSnapshot', () => {
    const change = {
      type: 'set' as const,
      task: { ...task, dueDate: new Date(DUE) },
      quadrantKey: 'ImportantUrgent' as const,
      order: 0,
      completed: false,
    };
    const data = taskToDocData(change, 'u1') as unknown as FirestoreTaskData;

    const [parsed] = toCloudSnapshot([{ id: 't1', data }], metadata).tasks
      .ImportantUrgent;
    expect(parsed).toMatchObject(change.task);
  });
});
