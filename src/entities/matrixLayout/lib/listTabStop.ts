import { MatrixKey, Tasks } from '@/shared/stores/tasksStore';
import { isSameStop } from './isSameStop';
import { listStops } from './listStops';
import { MatrixStop } from './matrixTabStop';

/**
 * The one place Tab reaches in List view (roving tabindex), among what
 * shows: the selected task, else the "Add a task" focused since the last
 * selection, else the last selected task, else the first task of the first
 * open section, else the "Add a task" of the first empty one. Null when
 * every section is collapsed: there's nothing to stop at.
 */
export const listTabStop = (
  tasks: Tasks,
  collapsedSections: MatrixKey[],
  selectedTaskId: string | null,
  lastSelectedTaskId: string | null,
  addTaskTabStop: MatrixKey | null,
): MatrixStop | null => {
  const stops = listStops(tasks, collapsedSections);
  const shown = (stop: MatrixStop) =>
    stops.find((shownStop) => isSameStop(shownStop, stop));

  return (
    (selectedTaskId && shown({ taskId: selectedTaskId })) ||
    (addTaskTabStop && shown({ emptyQuadrant: addTaskTabStop })) ||
    (lastSelectedTaskId && shown({ taskId: lastSelectedTaskId })) ||
    stops.find((stop) => 'taskId' in stop) ||
    stops[0] ||
    null
  );
};
