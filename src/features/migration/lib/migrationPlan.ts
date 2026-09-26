import type { TaskChange } from '@/shared/api/cloudMatrix';
import { MATRIX_KEYS } from '@/shared/consts';
import {
  RESTORE_FALLBACK_QUADRANT,
  type Task,
} from '@/shared/stores/tasksStore';
import type { MatrixTasks, MigrationPlan } from '../types';

const allTasks = ({ tasks, completedTasks }: MatrixTasks) => [
  ...Object.values(tasks).flat(),
  ...completedTasks,
];

const byNewest = (a: Task, b: Task) =>
  (b.completedAt?.getTime() ?? 0) - (a.completedAt?.getTime() ?? 0);

/**
 * What moving the device's Matrix to the cloud writes. Tasks keep their id,
 * so one the cloud has already isn't written again. In an empty cloud the
 * quadrants keep their order; otherwise the device's tasks go after the
 * cloud's, and Completed joins by completion time.
 */
export const migrationPlan = (
  device: MatrixTasks,
  cloud: MatrixTasks,
): MigrationPlan => {
  const cloudIds = new Set(allTasks(cloud).map(({ id }) => id));
  const deviceIds = new Set(allTasks(device).map(({ id }) => id));
  const isNew = ({ id }: Task) => !cloudIds.has(id);
  // Device tasks in the cloud are left from a move cut short
  const isCloudEmpty = [...cloudIds].every((id) => deviceIds.has(id));

  const active = MATRIX_KEYS.flatMap((quadrantKey) => {
    // After the last cloud task, whatever gaps its `order` has
    const cloudQuadrant = cloud.tasks[quadrantKey];
    const orderOffset = isCloudEmpty
      ? 0
      : Math.max(cloudQuadrant.length, (cloudQuadrant.at(-1)?.order ?? -1) + 1);
    const quadrant = isCloudEmpty
      ? device.tasks[quadrantKey]
      : device.tasks[quadrantKey].filter(isNew);
    return quadrant.flatMap((task, index): TaskChange[] =>
      isNew(task)
        ? [
            {
              type: 'set',
              task,
              quadrantKey,
              order: orderOffset + index,
              completed: false,
            },
          ]
        : [],
    );
  });

  const completedTasks = [
    ...cloud.completedTasks,
    ...device.completedTasks.filter(isNew),
  ].sort(byNewest);
  const completed = completedTasks.flatMap((task, order): TaskChange[] =>
    device.completedTasks.includes(task) && isNew(task)
      ? [
          {
            type: 'set',
            task,
            quadrantKey: task.quadrantKey ?? RESTORE_FALLBACK_QUADRANT,
            order,
            completed: true,
          },
        ]
      : [],
  );

  const changes = [...active, ...completed];
  if (changes.length === 0) return { decision: 'none', count: 0, changes };
  return {
    decision: isCloudEmpty ? 'move' : 'ask',
    count: changes.length,
    changes,
  };
};
