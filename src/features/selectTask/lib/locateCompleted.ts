import { Task } from '@/shared/stores/tasksStore';
import { CompletedLocation } from '../types';

export const locateCompleted = (
  completedTasks: Task[],
  taskId: string | null,
): CompletedLocation | null => {
  const index = completedTasks.findIndex(({ id }) => id === taskId);
  return index === -1 ? null : { task: completedTasks[index], index };
};
