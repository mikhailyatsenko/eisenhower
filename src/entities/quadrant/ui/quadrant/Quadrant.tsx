import { useDroppable } from '@dnd-kit/core';

import { MatrixKey } from '@/shared/stores/tasksStore';
import { quadrantStyles } from '../../lib/quadrantStyles';
import { Buttons } from './Buttons';

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

export const titleQuadrantMap = {
  ImportantUrgent: 'Do First',
  ImportantNotUrgent: 'Schedule',
  NotImportantUrgent: 'Delegate',
  NotImportantNotUrgent: 'Eliminate',
};

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
    ? `${orderIndex === 0 ? 'animate-from-bottom-appear w-[calc(55%-8px)] h-[calc((100vw)/2-32px)] sm:h-[calc(100vh/2)] transition-[width] duration-300' : 'w-[calc(45%-8px)] !opacity-25 h-[calc((100vw)/2-32px)] sm:h-[calc(100vh/2)] transition-[width] duration-300'}`
    : expandedQuadrant === null
      ? 'w-[calc(50%-8px)] h-[calc((100vw)/2-32px)] sm:h-[calc(100vh/2-64px)] min-h-40'
      : isExpandedCurrentQuadrant
        ? '!order-first max-h-[calc(100dvh-200px)] min-h-40 w-full !pb-0'
        : 'h-[calc(100vw/3-48px)] w-[calc((33.333%-8px))]';

  const animateByExpandQuadrant = isAnimateByExpandQuadrant
    ? 'animate-from-hide-to-show'
    : '';

  const animateByRecentlyAddedQuadrant =
    recentlyAddedQuadrant === quadrantKey
      ? 'animate-recently-added-quadrant'
      : '';

  const dragOverStyles = isDragOver ? '!bg-gray-400' : '';

  return (
    <div
      ref={setNodeRef}
      style={{ order: orderIndex }}
      className={`${quadrantStyles[quadrantKey]} ${actionStyles} ${animateByRecentlyAddedQuadrant} ${animateByExpandQuadrant} ${dragOverStyles} relative m-1 overflow-hidden rounded-md p-1 pt-4 text-gray-100 ease-in-out sm:p-6 dark:border dark:bg-gray-950`}
    >
      <h2 className="absolute top-1 right-2 mb-2 text-[0.5rem] text-gray-600 select-none sm:text-sm dark:text-gray-300">
        {titleQuadrantMap[quadrantKey]}
      </h2>
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
