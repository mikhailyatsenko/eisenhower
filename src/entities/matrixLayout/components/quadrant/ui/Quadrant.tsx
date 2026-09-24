import { useDroppable } from '@dnd-kit/core';

import { QUADRANTS } from '@/shared/consts';
import { MatrixKey } from '@/shared/stores/tasksStore';
import {
  openFormWithCategoryAction,
  selectTaskAction,
  useUIStore,
} from '@/shared/stores/uiStore';
import { QUADRANT_STYLES } from '../consts';
import { quadrantStyles } from '../lib/quadrantStyles';

export interface QuadrantProps {
  quadrantKey: MatrixKey;
  /** Id of the title, which names the quadrant's task list */
  titleId: string;
  isDragOver: boolean;
  orderIndex: number;
  isTypingNewTask: boolean;
  children: React.ReactNode;
  recentlyAddedQuadrant: MatrixKey | null;
  taskCount: number;
}

export const Quadrant: React.FC<QuadrantProps> = ({
  quadrantKey,
  titleId,
  isDragOver,
  orderIndex,
  isTypingNewTask,
  recentlyAddedQuadrant,
  taskCount,
  children,
}) => {
  const { setNodeRef } = useDroppable({
    id: quadrantKey,
    data: { quadrantKey },
  });

  const isNoTasks = taskCount === 0;

  const actionStyles = isTypingNewTask
    ? orderIndex === 0
      ? QUADRANT_STYLES.TYPING_NEW_TASK_ACTIVE
      : QUADRANT_STYLES.TYPING_NEW_TASK_INACTIVE
    : QUADRANT_STYLES.DEFAULT;

  const animateByRecentlyAddedQuadrant =
    recentlyAddedQuadrant === quadrantKey
      ? 'animate-recently-added-quadrant'
      : '';

  const hasSelection = useUIStore((state) => state.selectedTaskId !== null);

  // A click on empty space clears the selection. Until slice G a click in an
  // empty quadrant also opens the add form there.
  const handleQuadrantClick = (event: React.MouseEvent) => {
    if ((event.target as HTMLElement).closest('button')) return;
    if (hasSelection) selectTaskAction(null);
    if (isNoTasks) openFormWithCategoryAction(quadrantKey);
  };

  return (
    <div
      ref={setNodeRef}
      style={{ order: orderIndex }}
      className={`${quadrantStyles[quadrantKey]} ${actionStyles} ${animateByRecentlyAddedQuadrant} ${isDragOver ? QUADRANT_STYLES.DRAG_OVER : ''} ${QUADRANT_STYLES.CONTAINER} ${isNoTasks ? 'cursor-pointer' : ''}`}
      onClick={handleQuadrantClick}
    >
      <div className={QUADRANT_STYLES.HEADER}>
        {/* Names the task list, so it holds the title only */}
        <h2 id={titleId} className={QUADRANT_STYLES.TITLE}>
          {QUADRANTS[quadrantKey].title}
        </h2>
        <span className={QUADRANT_STYLES.COUNT}>
          <span aria-hidden="true">{taskCount}</span>
          <span className="sr-only">
            {taskCount} task{taskCount === 1 ? '' : 's'}
          </span>
        </span>
      </div>
      {children}
    </div>
  );
};
