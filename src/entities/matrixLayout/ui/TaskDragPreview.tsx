import { twMerge } from 'tailwind-merge';
import { MatrixKey, Task } from '@/shared/stores/tasksStore';
import { OVERDUE_STRIPE_CLASS } from '../components/deadlineLine';
import { TaskCardContent } from '../components/taskCardContent';
import { TASK_CARD_CLASS, colors } from '../consts';
import { useDeadlineStatus } from '../hooks';

interface TaskDragPreviewProps {
  task: Task;
  quadrantKey: MatrixKey;
}

/** What follows the pointer during a drag; hidden from screen readers */
export const TaskDragPreview: React.FC<TaskDragPreviewProps> = ({
  task,
  quadrantKey,
}) => {
  const status = useDeadlineStatus(task);

  return (
    <div
      aria-hidden="true"
      className={twMerge(
        TASK_CARD_CLASS,
        colors[quadrantKey],
        status === 'overdue' && OVERDUE_STRIPE_CLASS,
        'cursor-grabbing shadow-md',
      )}
    >
      <TaskCardContent task={task} status={status} />
    </div>
  );
};
