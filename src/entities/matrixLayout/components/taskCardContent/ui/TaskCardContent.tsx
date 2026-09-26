import { twMerge } from 'tailwind-merge';
import { Task } from '@/shared/stores/tasksStore';
import { DeadlineStatus } from '../../../lib';
import { DeadlineLine } from '../../deadlineLine';

interface TaskCardContentProps {
  task: Task;
  status: DeadlineStatus | null;
  /** In a quadrant open full screen the text isn't cut */
  isFullText?: boolean;
}

/** Text and deadline only: nothing on a matrix card is interactive */
export const TaskCardContent = ({
  task,
  status,
  isFullText,
}: TaskCardContentProps) => (
  <>
    {/* On a phone 12px and two lines at most; the full text is its name */}
    <div
      className={twMerge(
        'line-clamp-2 text-xs leading-tight break-words text-black sm:line-clamp-none sm:text-base sm:leading-5 dark:text-gray-200',
        isFullText && 'line-clamp-none text-sm leading-snug',
      )}
    >
      {task.text}
    </div>
    <DeadlineLine task={task} status={status} />
  </>
);
