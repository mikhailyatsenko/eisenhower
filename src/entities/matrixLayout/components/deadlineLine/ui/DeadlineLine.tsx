import { twMerge } from 'tailwind-merge';
import { useNow } from '@/shared/hooks';
import { formatDate } from '@/shared/lib/formatDate';
import { Task } from '@/shared/stores/tasksStore';
import { DeadlineStatus } from '../../../lib';
import { STATUS_BADGE_CLASS, STATUS_LABEL } from '../consts';

interface DeadlineLineProps {
  task: Task;
  status: DeadlineStatus | null;
  className?: string;
}

/**
 * The status in words, then the date: `⚠ OVERDUE Thu 24 Sept`. Plain text,
 * read out with the task; the colour only backs up the word.
 */
export const DeadlineLine = ({
  task,
  status,
  className,
}: DeadlineLineProps) => {
  const now = useNow();
  if (!task.dueDate) return null;

  return (
    <div
      className={twMerge(
        'mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] leading-4 text-gray-800 sm:justify-center sm:text-xs dark:text-gray-200',
        className,
      )}
    >
      {status && (
        <span
          className={twMerge(
            'rounded px-1 text-[10px] font-bold tracking-wide sm:text-[11px]',
            STATUS_BADGE_CLASS[status],
          )}
        >
          {status === 'overdue' && <span aria-hidden="true">⚠ </span>}
          {STATUS_LABEL[status]}
        </span>
      )}{' '}
      <span>
        {formatDate(task.dueDate, {
          hasTime: task.hasDueTime !== false,
          now,
        })}
      </span>
    </div>
  );
};
