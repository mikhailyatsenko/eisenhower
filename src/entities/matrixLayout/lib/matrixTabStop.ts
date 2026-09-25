import { MATRIX_KEYS } from '@/shared/consts';
import { MatrixKey, Tasks } from '@/shared/stores/tasksStore';
import { firstTaskId } from './firstTaskId';

/** Where the keyboard stands in the matrix: a task's card or an empty quadrant's "Add a task" */
export type MatrixStop = { taskId: string } | { emptyQuadrant: MatrixKey };

/**
 * The one place Tab reaches in the matrix (roving tabindex): the selected
 * task, else the "Add a task" focused since the last selection while its
 * quadrant is still empty, else the last selected task, else the first
 * task. In an empty matrix, the "Add a task" of Do First.
 */
export const matrixTabStop = (
  tasks: Tasks,
  selectedTaskId: string | null,
  lastSelectedTaskId: string | null,
  addTaskTabStop: MatrixKey | null,
): MatrixStop => {
  const isInMatrix = (taskId: string | null): taskId is string =>
    taskId !== null &&
    MATRIX_KEYS.some((key) => tasks[key].some(({ id }) => id === taskId));

  if (isInMatrix(selectedTaskId)) return { taskId: selectedTaskId };
  if (addTaskTabStop && tasks[addTaskTabStop].length === 0) {
    return { emptyQuadrant: addTaskTabStop };
  }
  if (isInMatrix(lastSelectedTaskId)) return { taskId: lastSelectedTaskId };
  const taskId = firstTaskId(tasks);
  return taskId ? { taskId } : { emptyQuadrant: MATRIX_KEYS[0] };
};
