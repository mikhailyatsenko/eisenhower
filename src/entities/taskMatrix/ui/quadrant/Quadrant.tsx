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
  isAnimateQuadrants: boolean;
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
  isAnimateQuadrants,
  handleToggleExpand,
  orderIndex,
  isTypingNewTask,
  tasks,
}) => {
  const { setNodeRef } = useDroppable({
    id: quadrantKey,
    data: { quadrantKey },
  });

  const isExpanded = expandedQuadrant === quadrantKey && !isTypingNewTask;
  const recentlyAddedQuadrant = useUIStore(getRecentlyAddedQuadrant);

  const baseStyles = `${quadrantStyles[quadrantKey]} ${recentlyAddedQuadrant === quadrantKey ? 'animate-recently-added-quadrant' : ''} ${isDragOver ? '!bg-gray-400' : ''}`;
  const typingStyles = isTypingNewTask
    ? `!h-[calc((100vw)/2-32px)] transition-[width] duration-300 sm:h-[calc((100vw-100vw/6)/2-32px)] ${orderIndex === 0 ? 'animate-from-bottom-appear !w-[calc(55%-8px)]' : '!w-[calc(45%-8px)] !opacity-25'}`
    : '';
  const defaultStyles =
    !isTypingNewTask && expandedQuadrant === null
      ? 'h-[calc((100vw)/2-32px)] w-[calc(50%-8px)] sm:h-[calc((100vw-100vw/6)/2-32px)]'
      : isExpanded
        ? '!order-first max-h-[calc(100dvh-550px)] min-h-40 w-full !pb-0'
        : 'h-[calc(100vw/3-48px)] w-[calc((33.333%-8px))]';

  const animateStyles = isAnimateQuadrants ? 'animate-from-hide-to-show' : '';

  return (
    <div
      ref={setNodeRef}
      style={{ order: orderIndex }}
      className={`${baseStyles} ${typingStyles} ${defaultStyles} relative m-1 overflow-hidden rounded-md p-1 pt-4 text-gray-100 ease-in-out sm:p-6 dark:border dark:bg-black ${animateStyles}`}
    >
      <h2 className="absolute top-1 right-2 mb-2 text-[0.5rem] text-gray-600 sm:text-sm dark:text-gray-300">
        {titleMap[quadrantKey]}
      </h2>
      <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
        <ul
          className={`relative z-2 list-none flex-col ${isExpanded ? 'flex pb-8' : 'hidden'} h-full overflow-x-hidden overflow-y-auto sm:flex`}
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

        <p className="text-foreground absolute top-0 left-1 z-0 text-7xl opacity-15 sm:hidden">
          {`${tasks.length} task${tasks.length !== 1 ? 's' : ''}`}
        </p>

        <div
          className={`relative z-2 flex h-full w-full items-center justify-center text-gray-500 ${isExpanded ? 'hidden' : 'flex sm:hidden'}`}
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
      {isExpanded && (
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
