import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { MatrixKey } from '../../model/types/quadrantTypes';
import { TaskItem } from '../taskItem/TaskItem';

interface CategoryBlockProps {
  title: string;
  quadrantKey: MatrixKey;
  tasks: string[];
  isActive: boolean;
}

export const priorityColorClasses: Record<MatrixKey, string> = {
  ImportantUrgent: 'bg-red-200 dark:border-red-300',
  ImportantNotUrgent: 'bg-amber-200 dark:border-amber-300',
  NotImportantUrgent: 'bg-blue-200 dark:border-blue-300',
  NotImportantNotUrgent: 'bg-green-200 dark:border-green-300',
};

export const Quadrant: React.FC<CategoryBlockProps> = ({
  title,
  quadrantKey,
  tasks,
  isActive,
}) => {
  const { setNodeRef } = useDroppable({
    id: quadrantKey,
    data: { quadrantKey },
  });

  return (
    <div
      ref={setNodeRef}
      className={`${priorityColorClasses[quadrantKey]} ${isActive ? '!bg-gray-400' : ''} relative m-1 min-h-40 w-[calc(50%-8px)] rounded-md p-6 text-gray-100 sm:min-h-80 dark:border dark:bg-black`}
    >
      <h2 className="absolute top-1 right-2 mb-2 text-[0.5rem] sm:text-sm">
        {title}
      </h2>
      <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
        <ul className="list-none">
          {tasks.map((task, index) => (
            <TaskItem
              key={task}
              task={task}
              quadrantKey={quadrantKey}
              index={index}
            />
          ))}
        </ul>
      </SortableContext>
    </div>
  );
};
