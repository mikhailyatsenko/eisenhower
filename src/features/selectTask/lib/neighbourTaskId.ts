import { Tasks } from '@/shared/stores/tasksStore';
import { TaskLocation } from '../types';
import { nearQuadrants } from './gridNeighbours';

/**
 * The task that takes the selection once the selected one has left its
 * quadrant: the next one, now at its position, else the previous one. In an
 * emptied quadrant, the task at the same position (or the last) of the
 * nearest non-empty quadrant: in the row, then in the column, then across.
 */
export const neighbourTaskId = (
  tasks: Tasks,
  { quadrantKey, index }: Pick<TaskLocation, 'quadrantKey' | 'index'>,
) => {
  const quadrantTasks = tasks[quadrantKey];
  const inQuadrant = quadrantTasks[index] ?? quadrantTasks[index - 1];
  if (inQuadrant) return inQuadrant.id;

  for (const nearKey of nearQuadrants(quadrantKey)) {
    const nearTasks = tasks[nearKey];
    if (nearTasks.length) {
      return nearTasks[Math.min(index, nearTasks.length - 1)].id;
    }
  }
  return null;
};
