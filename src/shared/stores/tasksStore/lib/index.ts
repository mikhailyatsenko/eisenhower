import type { TaskChange } from '@/shared/api/cloudMatrix';
import { MATRIX_KEYS } from '@/shared/consts';
import { RESTORE_FALLBACK_QUADRANT } from '../consts';
import { Tasks, Task } from '../types';

export const getEmptyTasksState = (): Tasks => {
  return MATRIX_KEYS.reduce<Tasks>((acc, quadrant) => {
    acc[quadrant] = [];
    return acc;
  }, {} as Tasks);
};

/** Writes every task of the Matrix and Completed, with its current order */
export const wholeMatrixChanges = (
  tasks: Tasks,
  completedTasks: Task[],
): TaskChange[] => [
  ...MATRIX_KEYS.flatMap((quadrantKey) =>
    tasks[quadrantKey].map(
      (task, order): TaskChange => ({
        type: 'set',
        task,
        quadrantKey,
        order,
        completed: false,
      }),
    ),
  ),
  ...completedTasks.map(
    (task, order): TaskChange => ({
      type: 'set',
      task,
      quadrantKey: task.quadrantKey ?? RESTORE_FALLBACK_QUADRANT,
      order,
      completed: true,
    }),
  ),
];
