import { Tasks } from '@/shared/stores/tasksStore';
import { ArrowKey, MatrixTarget, TaskLocation } from '../types';
import { isLeftColumn, rowNeighbour } from './gridNeighbours';

/**
 * Where an arrow goes from the given place: a task, or the "Add a task" of an
 * empty quadrant, which stands at position 0. Up and down stay in the
 * quadrant without wrapping; left and right cross to the other quadrant of
 * the 2×2 row, at the same position or its last task. Null when there's
 * nowhere to go.
 */
export const arrowTarget = (
  tasks: Tasks,
  { quadrantKey, index }: Pick<TaskLocation, 'quadrantKey' | 'index'>,
  key: ArrowKey,
): MatrixTarget | null => {
  const inQuadrant = (taskIndex: number) => {
    const taskId = tasks[quadrantKey][taskIndex]?.id;
    return taskId ? { taskId } : null;
  };

  if (key === 'ArrowDown') return inQuadrant(index + 1);
  if (key === 'ArrowUp') return inQuadrant(index - 1);

  // Left of the left column and right of the right one there's nothing
  if (isLeftColumn(quadrantKey) !== (key === 'ArrowRight')) return null;

  const targetKey = rowNeighbour(quadrantKey);
  const targetTasks = tasks[targetKey];
  if (!targetTasks.length) return { emptyQuadrant: targetKey };
  return { taskId: targetTasks[Math.min(index, targetTasks.length - 1)].id };
};
