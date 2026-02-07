import { useDroppable } from '@dnd-kit/core';

import { QUADRANT_TITLES } from '@/shared/consts';
import { MatrixKey } from '@/shared/stores/tasksStore';
import { openFormWithCategoryAction } from '@/shared/stores/uiStore';
import { Buttons } from '../../quadrantButtons/ui/QuadrantButtons';
import { QUADRANT_STYLES } from '../consts';
import { quadrantStyles } from '../lib/quadrantStyles';

export interface QuadrantProps {
  quadrantKey: MatrixKey;
  isDragOver: boolean;
  isAnimateByExpandQuadrant: boolean;
  expandedQuadrant: MatrixKey | null;
  handleToggleExpand: (quadrant: MatrixKey) => void;
  orderIndex: number;
  isTypingNewTask: boolean;
  children: React.ReactNode;
  recentlyAddedQuadrant: MatrixKey | null;
  isNoTasks: boolean;
}

export const Quadrant: React.FC<QuadrantProps> = ({
  quadrantKey,
  isDragOver,
  expandedQuadrant,
  isAnimateByExpandQuadrant,
  handleToggleExpand,
  orderIndex,
  isTypingNewTask,
  recentlyAddedQuadrant,
  isNoTasks,
  children,
}) => {
  const { setNodeRef } = useDroppable({
    id: quadrantKey,
    data: { quadrantKey },
  });

  const isExpandedCurrentQuadrant = expandedQuadrant === quadrantKey;

  const actionStyles = isTypingNewTask
    ? orderIndex === 0
      ? QUADRANT_STYLES.TYPING_NEW_TASK_ACTIVE
      : QUADRANT_STYLES.TYPING_NEW_TASK_INACTIVE
    : expandedQuadrant === null
      ? QUADRANT_STYLES.DEFAULT
      : isExpandedCurrentQuadrant
        ? QUADRANT_STYLES.EXPANDED
        : QUADRANT_STYLES.COLLAPSED;

  const animateByExpandQuadrant = isAnimateByExpandQuadrant
    ? 'animate-from-hide-to-show'
    : '';

  const animateByRecentlyAddedQuadrant =
    recentlyAddedQuadrant === quadrantKey
      ? 'animate-recently-added-quadrant'
      : '';

  const handleQuadrantClick = () => {
    if (isNoTasks) {
      openFormWithCategoryAction(quadrantKey);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={{ order: orderIndex }}
      className={`${quadrantStyles[quadrantKey]} ${actionStyles} ${animateByRecentlyAddedQuadrant} ${animateByExpandQuadrant} ${isDragOver ? QUADRANT_STYLES.DRAG_OVER : ''} ${QUADRANT_STYLES.CONTAINER} ${isNoTasks ? 'cursor-pointer' : ''}`}
      onClick={handleQuadrantClick}
    >
      <h2 className={QUADRANT_STYLES.TITLE}>{QUADRANT_TITLES[quadrantKey]}</h2>
      {children}
      {!isTypingNewTask && !isNoTasks && (
        <Buttons
          handleToggleExpand={handleToggleExpand}
          quadrantKey={quadrantKey}
          isExpandedCurrentQuadrant={isExpandedCurrentQuadrant}
        />
      )}
    </div>
  );
};
