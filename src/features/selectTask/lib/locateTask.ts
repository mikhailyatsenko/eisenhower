import { MATRIX_KEYS } from '@/shared/consts';
import { Tasks } from '@/shared/stores/tasksStore';
import { TaskLocation } from '../types';

export const locateTask = (
  tasks: Tasks,
  taskId: string | null,
): TaskLocation | null => {
  if (!taskId) return null;

  for (const quadrantKey of MATRIX_KEYS) {
    const index = tasks[quadrantKey].findIndex((task) => task.id === taskId);
    if (index !== -1) {
      return { task: tasks[quadrantKey][index], quadrantKey, index };
    }
  }
  return null;
};
