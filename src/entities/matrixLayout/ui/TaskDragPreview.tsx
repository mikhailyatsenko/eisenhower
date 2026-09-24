import { twMerge } from 'tailwind-merge';
import { MatrixKey, Task } from '@/shared/stores/tasksStore';
import { TaskCardContent } from '../components/taskCardContent';
import { TASK_CARD_CLASS, colors } from '../consts';

interface TaskDragPreviewProps {
  task: Task;
  quadrantKey: MatrixKey;
}

/** What follows the pointer during a drag; hidden from screen readers */
export const TaskDragPreview: React.FC<TaskDragPreviewProps> = ({
  task,
  quadrantKey,
}) => (
  <div
    aria-hidden="true"
    className={twMerge(
      TASK_CARD_CLASS,
      colors[quadrantKey],
      'cursor-grabbing shadow-md',
    )}
  >
    <TaskCardContent task={task} />
  </div>
);
