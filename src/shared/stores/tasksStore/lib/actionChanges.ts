import type { TaskChange } from '@/shared/api/cloudMatrix';
import { MATRIX_KEYS } from '@/shared/consts';
import { RESTORE_FALLBACK_QUADRANT } from '../consts';
import { Task, TaskArea, Tasks } from '../types';

/**
 * What an action writes to the cloud: the tasks it changed, and the tasks of
 * the quadrants it touched whose place differs from the `order` on the server.
 * Completed is shown by completion time, so there only the changed tasks go.
 * Other tasks stay as they are, so changes made elsewhere aren't overwritten.
 */
export const actionChanges = (
  { tasks, completedTasks }: { tasks: Tasks; completedTasks: Task[] },
  changedIds: string[],
  areas: TaskArea[],
): TaskChange[] =>
  [...MATRIX_KEYS, 'completed' as const]
    .filter((area) => areas.includes(area))
    .flatMap((area) => {
      const completed = area === 'completed';
      return (completed ? completedTasks : tasks[area]).flatMap(
        (task, order): TaskChange[] =>
          changedIds.includes(task.id) || (!completed && task.order !== order)
            ? [
                {
                  type: 'set',
                  task,
                  quadrantKey: completed
                    ? (task.quadrantKey ?? RESTORE_FALLBACK_QUADRANT)
                    : area,
                  order,
                  completed,
                },
              ]
            : [],
      );
    });
