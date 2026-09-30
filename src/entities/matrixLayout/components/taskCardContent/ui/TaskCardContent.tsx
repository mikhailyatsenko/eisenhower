import { twMerge } from 'tailwind-merge';
import { Task } from '@/shared/stores/tasksStore';
import { DeadlineStatus } from '../../../lib';
import { DeadlineLine } from '../../deadlineLine';
import { CARD_LAYOUT_CLASS, DRAFT_CLASS } from '../consts';
import { CardLayout } from '../types';

interface TaskCardContentProps {
  task: Task;
  status: DeadlineStatus | null;
  layout?: CardLayout;
  /** The text being edited in the action panel, shown in its place */
  draft?: string | null;
}

/**
 * Text and deadline only: nothing on a matrix card is interactive. While
 * its text is edited, the draft shows framed by a dashed line.
 */
export const TaskCardContent = ({
  task,
  status,
  layout = 'cell',
  draft = null,
}: TaskCardContentProps) => (
  <>
    <div
      className={twMerge(
        'break-words text-black dark:text-gray-200',
        CARD_LAYOUT_CLASS[layout].text,
        draft !== null && DRAFT_CLASS,
      )}
    >
      {draft?.trim() === '' ? (
        <span className="italic opacity-70">(empty)</span>
      ) : (
        (draft ?? task.text)
      )}
    </div>
    <DeadlineLine
      task={task}
      status={status}
      className={CARD_LAYOUT_CLASS[layout].deadline}
    />
  </>
);
