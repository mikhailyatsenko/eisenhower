import { Task } from '@/shared/stores/tasksStore';
import { DeadlineBadge } from '../../deadlineBadge';

/** Text and deadline only: nothing on a matrix card is interactive */
export const TaskCardContent = ({ task }: { task: Task }) => (
  <>
    {/* On a phone 12px and two lines at most; the full text is its name */}
    <div className="line-clamp-2 text-xs leading-tight break-words text-black sm:line-clamp-none sm:text-base sm:leading-5 dark:text-gray-200">
      {task.text}
    </div>
    {task.dueDate && (
      <div className="mt-0.5">
        <DeadlineBadge task={task} />
      </div>
    )}
  </>
);
