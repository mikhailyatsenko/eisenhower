import { Tasks } from '@/shared/stores/tasksStore';
import { TaskLocation } from '../types';

/**
 * The task that takes the selection once the selected one has left its
 * quadrant: the next one, now at its position, else the previous one. Null
 * in an emptied quadrant, whose "Add a task" then takes the focus.
 */
export const neighbourTaskId = (
  tasks: Tasks,
  { quadrantKey, index }: Pick<TaskLocation, 'quadrantKey' | 'index'>,
) => {
  const quadrantTasks = tasks[quadrantKey];
  return (quadrantTasks[index] ?? quadrantTasks[index - 1])?.id ?? null;
};
