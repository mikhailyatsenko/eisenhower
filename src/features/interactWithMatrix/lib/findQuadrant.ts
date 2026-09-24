import { MatrixKey, Tasks } from '@/shared/stores/tasksStore';

/** The quadrant the task is in, or undefined if it isn't in the matrix */
export const findQuadrant = (tasks: Tasks, taskId: string) =>
  (Object.keys(tasks) as MatrixKey[]).find((key) =>
    tasks[key].some((task) => task.id === taskId),
  );
