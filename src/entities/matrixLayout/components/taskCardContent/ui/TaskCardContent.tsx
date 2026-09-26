import { twMerge } from 'tailwind-merge';
import { Task } from '@/shared/stores/tasksStore';
import { DeadlineStatus } from '../../../lib';
import { DeadlineLine } from '../../deadlineLine';
import { CARD_LAYOUT_CLASS } from '../consts';
import { CardLayout } from '../types';

interface TaskCardContentProps {
  task: Task;
  status: DeadlineStatus | null;
  layout?: CardLayout;
}

/** Text and deadline only: nothing on a matrix card is interactive */
export const TaskCardContent = ({
  task,
  status,
  layout = 'cell',
}: TaskCardContentProps) => (
  <>
    <div
      className={twMerge(
        'break-words text-black dark:text-gray-200',
        CARD_LAYOUT_CLASS[layout].text,
      )}
    >
      {task.text}
    </div>
    <DeadlineLine
      task={task}
      status={status}
      className={CARD_LAYOUT_CLASS[layout].deadline}
    />
  </>
);
