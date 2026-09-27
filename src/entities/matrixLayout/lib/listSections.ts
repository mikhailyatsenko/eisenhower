import { MATRIX_KEYS } from '@/shared/consts';
import { MatrixKey, Task, Tasks } from '@/shared/stores/tasksStore';
import { ListSection } from '../types';
import { isSectionCollapsed } from './isSectionCollapsed';

/**
 * The sections the keyboard walks in List view, in matrix order and
 * Completed last: collapsed ones are left out. `shownCompleted` is what
 * Completed shows, none while it's collapsed.
 */
export const listSections = (
  tasks: Tasks,
  collapsedSections: MatrixKey[],
  shownCompleted: Task[],
): ListSection[] => [
  ...MATRIX_KEYS.filter(
    (key) => !isSectionCollapsed(tasks, collapsedSections, key),
  ).map((area) => ({
    area,
    stops: tasks[area].length
      ? tasks[area].map(({ id }) => ({ taskId: id }))
      : [{ emptyQuadrant: area }],
  })),
  ...(shownCompleted.length
    ? [
        {
          area: 'completed' as const,
          stops: shownCompleted.map(({ id }) => ({ taskId: id })),
        },
      ]
    : []),
];
