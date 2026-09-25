import { useDroppable } from '@dnd-kit/core';
import { twMerge } from 'tailwind-merge';

import { MatrixKey } from '@/shared/stores/tasksStore';
import { selectTaskAction, useUIStore } from '@/shared/stores/uiStore';
import { FullScreenMode, QuadrantHeader } from '../../quadrantHeader';
import { DRAG_OVER_RING, QUADRANT_STYLES } from '../consts';
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
  /** A button after the title in the header */
  headerAction: React.ReactNode;
  /** A click on empty space with no task selected */
  onEmptySpaceClick: () => void;
}

// What isn't empty space: a card, a button (the header's, "+N below") or a field
const NOT_EMPTY_SPACE = '[role="option"], button, input';

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
  headerAction,
  onEmptySpaceClick,
  children,
}) => {
  const { setNodeRef } = useDroppable({
    id: quadrantKey,
    data: { quadrantKey },
  });

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

  // A click on empty space clears the selection, and only that: without a
  // selection it's the quadrant's own
  const handleQuadrantClick = (event: React.MouseEvent) => {
    if ((event.target as HTMLElement).closest(NOT_EMPTY_SPACE)) return;
    if (hasSelection) selectTaskAction(null);
    else onEmptySpaceClick();
  };

  return (
    <div
      ref={setNodeRef}
      style={{ order: orderIndex }}
      className={twMerge(
        quadrantStyles[quadrantKey],
        actionStyles,
        animateByRecentlyAddedQuadrant,
        isDragOver && [QUADRANT_STYLES.DRAG_OVER, DRAG_OVER_RING[quadrantKey]],
        QUADRANT_STYLES.CONTAINER,
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
        headerAction={headerAction}
      />
      {children}
    </div>
  );
};
