import { listStops } from '@/entities/matrixLayout';
import { MatrixKey, Tasks } from '@/shared/stores/tasksStore';

/**
 * The last task of List view's open sections, Completed aside: where the
 * focus goes once Completed has emptied. Null when none shows.
 */
export const lastShownTaskId = (tasks: Tasks, collapsedSections: MatrixKey[]) =>
  listStops(tasks, collapsedSections, [])
    .flatMap((stop) => ('taskId' in stop ? [stop.taskId] : []))
    .at(-1) ?? null;
