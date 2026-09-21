import { STORAGE_KEY } from '../consts';
import { useTaskStore } from './useTasksStore';

jest.mock('@/shared/config/firebaseConfig', () => ({ db: {}, auth: {} }));

describe('useTaskStore persistence', () => {
  it('restores task dates as Date objects after rehydration', async () => {
    const createdAt = '2026-09-20T10:00:00.000Z';
    const dueDate = '2026-09-22T08:30:00.000Z';
    const completedAt = '2026-09-21T12:00:00.000Z';

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        state: {
          localTasks: {
            ImportantUrgent: [
              { id: '1', text: 'Pay rent', createdAt, dueDate },
            ],
            ImportantNotUrgent: [],
            NotImportantUrgent: [],
            NotImportantNotUrgent: [],
          },
          localCompletedTasks: [
            {
              id: '2',
              text: 'Send invoice',
              createdAt,
              completedAt,
              quadrantKey: 'ImportantUrgent',
            },
          ],
        },
        version: 0,
      }),
    );

    await useTaskStore.persist.rehydrate();

    const { localTasks, localCompletedTasks } = useTaskStore.getState();
    const [task] = localTasks.ImportantUrgent;
    const [completedTask] = localCompletedTasks;

    expect(task.createdAt).toBeInstanceOf(Date);
    expect(task.dueDate).toBeInstanceOf(Date);
    expect(task.dueDate?.toISOString()).toBe(dueDate);
    expect(completedTask.createdAt).toBeInstanceOf(Date);
    expect(completedTask.completedAt).toBeInstanceOf(Date);
  });
});
