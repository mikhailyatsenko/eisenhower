import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { MatrixKey, Task } from '../../model/types/quadrantTypes';
import { TaskItem } from '../taskItem/TaskItem';

interface CategoryBlockProps {
  quadrantKey: MatrixKey;
  tasks: Task[];
  isActive: boolean;
  isDimmed: boolean;
  isAnimateNotExpandedQuadrant: boolean;
  expandedQuadrant: MatrixKey | null;
  handleToggleExpand: (quadrant: MatrixKey) => void;
}

const quadrantColors: Record<MatrixKey, string> = {
  ImportantUrgent: 'bg-red-200 dark:border-red-300',
  ImportantNotUrgent: 'bg-amber-200 dark:border-amber-300',
  NotImportantUrgent: 'bg-blue-200 dark:border-blue-300',
  NotImportantNotUrgent: 'bg-green-200 dark:border-green-300',
};

const buttonColors: Record<MatrixKey, string> = {
  ImportantUrgent: 'bg-red-300 dark:border-red-300 hover:bg-red-400',
  ImportantNotUrgent: 'bg-amber-300 dark:border-amber-300 hover:bg-amber-400',
  NotImportantUrgent: 'bg-blue-300 dark:border-blue-300 hover:bg-blue-400',
  NotImportantNotUrgent:
    'bg-green-300 dark:border-green-300 hover:bg-green-400',
};

const titleMap: Record<MatrixKey, string> = {
  ImportantUrgent: 'Do First',
  ImportantNotUrgent: 'Schedule',
  NotImportantUrgent: 'Delegate',
  NotImportantNotUrgent: 'Eliminate',
};

export const Quadrant: React.FC<CategoryBlockProps> = ({
  quadrantKey,
  tasks,
  isActive,
  isDimmed,
  expandedQuadrant,
  isAnimateNotExpandedQuadrant,
  handleToggleExpand,
}) => {
  const { setNodeRef } = useDroppable({
    id: quadrantKey,
    data: { quadrantKey },
  });

  const isExpanded = expandedQuadrant === quadrantKey;

  return (
    <div
      ref={setNodeRef}
      className={`${quadrantColors[quadrantKey]} ${isActive ? '!bg-gray-400' : ''} ${isDimmed ? 'opacity-50' : ''} m-1 ${expandedQuadrant === null ? 'h-40 w-[calc(50%-8px)]' : isExpanded ? 'order-first h-80 w-full !pb-8' : `h-1 w-1`} relative overflow-hidden rounded-md p-6 text-gray-100 transition-all duration-300 ease-in-out sm:h-80 dark:border dark:bg-black ${isAnimateNotExpandedQuadrant ? 'animate-from-hide-to-show' : ''}`}
    >
      <h2 className="absolute top-1 right-2 mb-2 text-[0.5rem] text-gray-600 sm:text-sm dark:text-gray-300">
        {titleMap[quadrantKey]}
      </h2>
      <div className={`h-full w-full overflow-x-hidden overflow-y-auto`}>
        <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
          <ul
            className={`list-none flex-col ${isExpanded ? 'flex' : 'hidden'} sm:flex`}
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
          <div
            className={`flex h-full w-full items-center justify-center text-gray-500 ${isExpanded ? 'hidden' : 'flex'}`}
          >
            {tasks.length > 0 ? (
              <button
                className={`${buttonColors[quadrantKey]} cursor-pointer rounded-md p-2 text-gray-100 dark:border-2 dark:bg-transparent`}
                onClick={() => handleToggleExpand(quadrantKey)}
              >
                Show {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
              </button>
            ) : (
              'Empty'
            )}
          </div>
        </SortableContext>
      </div>
      {isExpanded && (
        <button
          onClick={() => handleToggleExpand(quadrantKey)}
          className={`absolute bottom-0 left-0 flex h-8 w-full cursor-pointer items-center justify-center bg-gray-500 opacity-60 hover:opacity-85 dark:bg-gray-300`}
        >
          <p className="opacity- text-background text-sm font-bold">
            Collapse Quadrant
          </p>
        </button>
      )}
    </div>
  );
};
