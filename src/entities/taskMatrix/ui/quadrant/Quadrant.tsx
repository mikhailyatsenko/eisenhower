import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { getRecentlyAddedQuadrant } from '../../model/selectors/uiSelectors';
import { useUIStore } from '../../model/store/uiStore';
import { MatrixKey, Task } from '../../model/types/taskMatrixTypes';
import { TaskItem } from '../taskItem/TaskItem';

interface CategoryBlockProps {
  quadrantKey: MatrixKey;
  isDragOver: boolean;
  isAnimateByExpandQuadrant: boolean;
  tasks: Task[];
  expandedQuadrant: MatrixKey | null;
  handleToggleExpand: (quadrant: MatrixKey) => void;
  orderIndex: number;
  isTypingNewTask: boolean;
  // isDimmed: boolean;
}

const quadrantStyles = {
  ImportantUrgent: 'bg-red-200 dark:border-red-300',
  ImportantNotUrgent: 'bg-amber-200 dark:border-amber-300',
  NotImportantUrgent: 'bg-blue-200 dark:border-blue-300',
  NotImportantNotUrgent: 'bg-green-200 dark:border-green-300',
};

const buttonStyles = {
  ImportantUrgent: 'bg-red-300 dark:border-red-300 hover:bg-red-400',
  ImportantNotUrgent: 'bg-amber-300 dark:border-amber-300 hover:bg-amber-400',
  NotImportantUrgent: 'bg-blue-300 dark:border-blue-300 hover:bg-blue-400',
  NotImportantNotUrgent:
    'bg-green-300 dark:border-green-300 hover:bg-green-400',
};

const titleMap = {
  ImportantUrgent: 'Do First',
  ImportantNotUrgent: 'Schedule',
  NotImportantUrgent: 'Delegate',
  NotImportantNotUrgent: 'Eliminate',
};

export const Quadrant: React.FC<CategoryBlockProps> = ({
  quadrantKey,
  isDragOver,
  expandedQuadrant,
  isAnimateByExpandQuadrant,
  handleToggleExpand,
  orderIndex,
  isTypingNewTask,
  tasks,
}) => {
  const { setNodeRef } = useDroppable({
    id: quadrantKey,
    data: { quadrantKey },
  });

  const isExpandedCurrentQuadrant =
    expandedQuadrant === quadrantKey && !isTypingNewTask;
  const recentlyAddedQuadrant = useUIStore(getRecentlyAddedQuadrant);

  const actionStyles = isTypingNewTask
    ? `${orderIndex === 0 ? 'animate-from-bottom-appear w-[calc(55%-8px)] h-[calc((100vw)/2-32px)] sm:h-[calc(100vh/2)] transition-[width] duration-300' : 'w-[calc(45%-8px)] !opacity-25 h-[calc((100vw)/2-32px)] sm:h-[calc(100vh/2)] transition-[width] duration-300'}`
    : expandedQuadrant === null
      ? 'w-[calc(50%-8px)] h-[calc((100vw)/2-32px)] sm:h-[calc(100vh/2)]'
      : isExpandedCurrentQuadrant
        ? '!order-first max-h-[calc(100dvh-550px)] min-h-40 w-full !pb-0'
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
      <h2 className="absolute top-1 right-2 mb-2 text-[0.5rem] text-gray-600 sm:text-sm dark:text-gray-300">
        {titleMap[quadrantKey]}
      </h2>
      <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
        <ul
          className={`scrollbar-hidden relative z-2 list-none flex-col ${isExpandedCurrentQuadrant ? 'flex pb-8' : 'hidden'} h-full overflow-x-hidden overflow-y-auto sm:flex`}
        >
          {tasks.map((task, index) => (
            <TaskItem
              key={task.id}
              task={task}
              quadrantKey={quadrantKey}
              index={index}
            />
          ))}
        </ul>

        <p
          className={`text-foreground absolute top-0 left-1 z-0 text-7xl opacity-15 sm:top-1 sm:left-6 sm:text-sm sm:opacity-50 ${tasks.length === 0 ? 'sm:!text-7xl sm:!opacity-25' : ''}`}
        >
          {!isExpandedCurrentQuadrant &&
            `${tasks.length} task${tasks.length !== 1 ? 's' : ''}`}
        </p>

        <div
          className={`relative z-2 flex h-full w-full items-center justify-center text-gray-500 ${isExpandedCurrentQuadrant ? 'hidden' : 'flex sm:hidden'}`}
        >
          {!isTypingNewTask && tasks.length > 0 ? (
            <button
              className={`${buttonStyles[quadrantKey]} cursor-pointer rounded-md p-2 text-gray-100 dark:border-2 dark:bg-transparent`}
              onClick={() => handleToggleExpand(quadrantKey)}
            >
              Expand
            </button>
          ) : (
            ''
          )}
        </div>
      </SortableContext>
      {isExpandedCurrentQuadrant && (
        <button
          onClick={() => handleToggleExpand(quadrantKey)}
          className={`absolute bottom-0 left-0 z-3 flex h-8 w-full cursor-pointer items-center justify-center bg-gray-500 opacity-60 hover:opacity-85 dark:bg-gray-300`}
        >
          <p className="text-background text-sm">Collapse Quadrant</p>
        </button>
      )}
    </div>
  );
};
