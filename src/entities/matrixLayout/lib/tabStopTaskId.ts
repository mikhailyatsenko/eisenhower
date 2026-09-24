import { MATRIX_KEYS } from '@/shared/consts';
import { Tasks } from '@/shared/stores/tasksStore';
import { firstTaskId } from './firstTaskId';

/**
 * The one task Tab reaches in the matrix (roving tabindex): the selected
 * task, else the last selected one, else the first task. Null in an empty
 * matrix, which then has no Tab stop.
 */
export const tabStopTaskId = (
  tasks: Tasks,
  selectedTaskId: string | null,
  lastSelectedTaskId: string | null,
) => {
  const isInMatrix = (taskId: string | null) =>
    taskId !== null &&
    MATRIX_KEYS.some((key) => tasks[key].some(({ id }) => id === taskId));

  if (isInMatrix(selectedTaskId)) return selectedTaskId;
  if (isInMatrix(lastSelectedTaskId)) return lastSelectedTaskId;
  return firstTaskId(tasks);
};
