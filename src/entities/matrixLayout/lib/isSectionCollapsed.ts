import { MatrixKey, Tasks } from '@/shared/stores/tasksStore';

/** A stored collapse holds only while the section has tasks */
export const isSectionCollapsed = (
  tasks: Tasks,
  collapsedSections: MatrixKey[],
  quadrantKey: MatrixKey,
) => tasks[quadrantKey].length > 0 && collapsedSections.includes(quadrantKey);
