import { Task } from '@/shared/stores/tasksStore';
import { DeadlineBadge } from '../../deadlineBadge';

/** Text and deadline only: nothing on a matrix card is interactive */
export const TaskCardContent = ({ task }: { task: Task }) => (
  <>
    <div className="leading-5 break-words text-black dark:text-gray-200">
      {task.text}
    </div>
    {task.dueDate && (
      <div className="mt-0.5">
        <DeadlineBadge task={task} />
      </div>
    )}
  </>
);
