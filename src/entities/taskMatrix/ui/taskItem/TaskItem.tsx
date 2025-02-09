import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MatrixKey } from '../../model/types/quadrantTypes';

interface TaskItemProps {
  task: string;
  quadrantKey: MatrixKey;
  index: number;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  quadrantKey,
  index,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: task,
      data: { quadrantKey, index },
    });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className="p-2"
    >
      {task}
    </li>
  );
};
