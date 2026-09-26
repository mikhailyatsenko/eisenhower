import { MATRIX_KEYS } from '@/shared/consts';
import { MatrixKey, Tasks } from '@/shared/stores/tasksStore';
import { ListSection } from '../types';
import { isSectionCollapsed } from './isSectionCollapsed';

/** The sections the keyboard walks in List view, in matrix order: collapsed ones are left out */
export const listSections = (
  tasks: Tasks,
  collapsedSections: MatrixKey[],
): ListSection[] =>
  MATRIX_KEYS.filter(
    (key) => !isSectionCollapsed(tasks, collapsedSections, key),
  ).map((quadrantKey) => ({
    quadrantKey,
    stops: tasks[quadrantKey].length
      ? tasks[quadrantKey].map(({ id }) => ({ taskId: id }))
      : [{ emptyQuadrant: quadrantKey }],
  }));
