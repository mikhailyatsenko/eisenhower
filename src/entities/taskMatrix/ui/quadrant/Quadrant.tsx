import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  getSelectedCategory,
  getTaskInputText,
} from '../../model/selectors/uiSelectors';
import { useUIStore } from '../../model/store/uiStore';
import { MatrixKey, Task } from '../../model/types/taskMatrixTypes';
import { TaskItem } from '../taskItem/TaskItem';

interface CategoryBlockProps {
  quadrantKey: MatrixKey;
  isActive: boolean;
  isAnimateQuadrants: boolean;
  tasks: Task[];
  expandedQuadrant: MatrixKey | null;
  handleToggleExpand: (quadrant: MatrixKey) => void;
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
  isActive,
  expandedQuadrant,
  isAnimateQuadrants,
  handleToggleExpand,
  tasks,
}) => {
  const { setNodeRef } = useDroppable({
    id: quadrantKey,
    data: { quadrantKey },
  });

  const taskInputText = useUIStore(getTaskInputText);
  const selectedCategory = useUIStore(getSelectedCategory);

  const isExpanded = expandedQuadrant === quadrantKey;

  const isDimmed =
    taskInputText.trim() !== '' && selectedCategory !== quadrantKey;

  return (
    <div
      ref={setNodeRef}
      className={`${quadrantStyles[quadrantKey]} ${isActive ? '!bg-gray-400' : ''} ${isDimmed ? 'opacity-30' : ''} ${expandedQuadrant === null ? 'h-40 w-[calc(50%-8px)]' : isExpanded ? 'order-first max-h-[calc(100dvh-250px)] min-h-40 w-full !pb-0' : `h-8 w-[calc((33.333%-8px))]`} relative m-1 overflow-hidden rounded-md p-6 text-gray-100 ease-in-out sm:h-80 dark:border dark:bg-black ${isAnimateQuadrants ? 'animate-from-hide-to-show' : ''}`}
    >
      <h2 className="absolute top-1 right-2 mb-2 text-[0.5rem] text-gray-600 sm:text-sm dark:text-gray-300">
        {titleMap[quadrantKey]}
      </h2>
      <div className="scrollbar-hidden h-full w-full overflow-x-hidden overflow-y-auto">
        <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
          <ul
            className={`list-none flex-col ${isExpanded ? 'flex pb-8' : 'hidden'} sm:flex`}
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
            className={`flex h-full w-full items-center justify-center text-gray-500 ${isExpanded ? 'hidden' : 'flex sm:hidden'}`}
          >
            {tasks.length > 0 ? (
              <button
                className={`${buttonStyles[quadrantKey]} cursor-pointer rounded-md p-2 text-gray-100 dark:border-2 dark:bg-transparent`}
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
          className="absolute bottom-0 left-0 flex h-8 w-full cursor-pointer items-center justify-center bg-gray-500 opacity-60 hover:opacity-85 dark:bg-gray-300"
        >
          <p className="text-background text-sm">Collapse Quadrant</p>
        </button>
      )}
    </div>
  );
};
