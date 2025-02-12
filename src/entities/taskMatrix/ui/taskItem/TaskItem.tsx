import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MatrixKey } from '../../model/types/quadrantTypes';

interface TaskItemProps {
  task: string;
  quadrantKey: MatrixKey;
  index: number;
}

export const colors: Record<MatrixKey, string> = {
  ImportantUrgent: 'bg-red-300',
  ImportantNotUrgent: 'bg-amber-300',
  NotImportantUrgent: 'bg-blue-300',
  NotImportantNotUrgent: 'bg-green-300',
};

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  quadrantKey,
  index,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task,
    data: { quadrantKey, index },
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <li
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className={`p-1 ${isDragging ? 'opacity-0' : ''} min-h-12 ${colors[quadrantKey]} flex cursor-grab list-none items-center justify-center rounded-md text-gray-100`}
    >
      {task}
    </li>
  );
};
