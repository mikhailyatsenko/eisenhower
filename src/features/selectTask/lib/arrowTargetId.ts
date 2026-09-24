import { Tasks } from '@/shared/stores/tasksStore';
import { ArrowKey, TaskLocation } from '../types';
import { isLeftColumn, rowNeighbour } from './gridNeighbours';

/**
 * The task an arrow selects from the given one. Up and down stay in the
 * quadrant without wrapping; left and right cross to the other quadrant of
 * the 2×2 row, at the same position or its last task. Null when there's
 * nowhere to go, an empty quadrant included.
 */
export const arrowTargetId = (
  tasks: Tasks,
  { quadrantKey, index }: Pick<TaskLocation, 'quadrantKey' | 'index'>,
  key: ArrowKey,
) => {
  const quadrantTasks = tasks[quadrantKey];

  if (key === 'ArrowDown') return quadrantTasks[index + 1]?.id ?? null;
  if (key === 'ArrowUp') return quadrantTasks[index - 1]?.id ?? null;

  // Left of the left column and right of the right one there's nothing
  if (isLeftColumn(quadrantKey) !== (key === 'ArrowRight')) return null;

  const targetTasks = tasks[rowNeighbour(quadrantKey)];
  return targetTasks[Math.min(index, targetTasks.length - 1)]?.id ?? null;
};
