import { useDroppable } from '@dnd-kit/core';
import { twMerge } from 'tailwind-merge';

import { MatrixKey } from '@/shared/stores/tasksStore';
import {
  openFormWithCategoryAction,
  selectTaskAction,
  useUIStore,
} from '@/shared/stores/uiStore';
import { FullScreenMode, QuadrantHeader } from '../../quadrantHeader';
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
  fullScreen: FullScreenMode;
  onFullScreenChange: (isOpen: boolean) => void;
}

export const Quadrant: React.FC<QuadrantProps> = ({
  quadrantKey,
  titleId,
  isDragOver,
  orderIndex,
  isTypingNewTask,
  recentlyAddedQuadrant,
  taskCount,
  fullScreen,
  onFullScreenChange,
  children,
}) => {
  const { setNodeRef } = useDroppable({
    id: quadrantKey,
    data: { quadrantKey },
  });

  const isNoTasks = taskCount === 0;

  const isFullScreen = fullScreen === 'open';

  const actionStyles =
    isTypingNewTask && !isFullScreen
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
      className={twMerge(
        quadrantStyles[quadrantKey],
        actionStyles,
        animateByRecentlyAddedQuadrant,
        isDragOver && QUADRANT_STYLES.DRAG_OVER,
        QUADRANT_STYLES.CONTAINER,
        isNoTasks && 'cursor-pointer',
        isFullScreen && QUADRANT_STYLES.FULL_SCREEN,
      )}
      onClick={handleQuadrantClick}
    >
      <QuadrantHeader
        quadrantKey={quadrantKey}
        titleId={titleId}
        taskCount={taskCount}
        fullScreen={fullScreen}
        onFullScreenChange={onFullScreenChange}
      />
      {children}
    </div>
  );
};
