import { format, formatDistanceToNowStrict } from 'date-fns';
import { twMerge } from 'tailwind-merge';
import { Task } from '@/shared/stores/tasksStore';

interface DeadlineBadgeProps {
  task: Task;
}

/** The deadline relative to now: "in 3 days" or "2 hours overdue" */
export const DeadlineBadge: React.FC<DeadlineBadgeProps> = ({ task }) => {
  if (!task.dueDate) return null;

  const dueDate = new Date(task.dueDate);
  const distance = formatDistanceToNowStrict(dueDate);
  const isOverdue = new Date() > dueDate;

  return (
    <span
      title={format(dueDate, 'dd/MM/yyyy HH:mm')}
      className={twMerge(
        'inline-block shrink-0 rounded px-1 text-[10px] font-bold',
        isOverdue
          ? 'bg-red-700 text-white'
          : 'bg-black/10 text-gray-800 dark:bg-white/10 dark:text-gray-200',
      )}
    >
      {isOverdue ? (
        `${distance} overdue`
      ) : (
        <>
          <span className="sr-only">Deadline </span>in {distance}
        </>
      )}
    </span>
  );
};
