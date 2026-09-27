import { Task } from '../types';

/**
 * Completed as it shows: the newest first, by completion time, in both
 * Storages. Tasks without a time, from long ago, go last in their order.
 */
export const newestCompletedFirst = (completedTasks: Task[]) =>
  [...completedTasks].sort(
    (a, b) => (b.completedAt?.getTime() ?? 0) - (a.completedAt?.getTime() ?? 0),
  );
