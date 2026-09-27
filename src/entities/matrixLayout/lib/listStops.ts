import { MatrixKey, Task, Tasks } from '@/shared/stores/tasksStore';
import { listSections } from './listSections';

/** Every place the keyboard stops in List view, top to bottom */
export const listStops = (
  tasks: Tasks,
  collapsedSections: MatrixKey[],
  shownCompleted: Task[],
) =>
  listSections(tasks, collapsedSections, shownCompleted).flatMap(
    ({ stops }) => stops,
  );
