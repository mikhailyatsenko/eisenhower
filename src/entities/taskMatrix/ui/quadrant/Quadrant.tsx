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
  ImportantUrgent: 'bg-red-200',
  ImportantNotUrgent: 'bg-yellow-200',
  NotImportantUrgent: 'bg-blue-200',
  NotImportantNotUrgent: 'bg-green-200',
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
      className={`${priorityColorClasses[quadrantKey]} ${isActive ? 'bg-opacity-75' : ''} rounded-2xl p-6 text-white shadow-lg`}
    >
      <h2 className="mb-2 text-xl font-semibold">{title}</h2>
      <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
        <ul className="list-disc pl-4">
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
