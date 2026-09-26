import { useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import CheckIcon from '@/shared/icons/check-icon.svg';
import DeleteIcon from '@/shared/icons/delete-icon.svg';
import EditIcon from '@/shared/icons/edit-icon.svg';
import { Deadline, MatrixKey, Task } from '@/shared/stores/tasksStore';
import { useTaskFocusRequest } from '@/shared/stores/uiStore';
import { Linkify } from '@/shared/ui/linkify';
import { DeadlineLine, OVERDUE_STRIPE_CLASS } from '../components/deadlineLine';
import { colors } from '../consts';
import { useDeadlineStatus } from '../hooks';
import { EditTaskDialog } from './EditTaskDialog';

interface ListTaskItemProps {
  task: Task;
  quadrantKey: MatrixKey;
  deleteTaskAction: (quadrantKey: MatrixKey, taskId: string) => void;
  editTaskAction: (
    quadrantKey: MatrixKey,
    taskId: string,
    newText: string,
    newDeadline?: Deadline | null,
    newQuadrantKey?: MatrixKey,
  ) => void;
  completeTaskAction: (quadrantKey: MatrixKey, taskId: string) => void;
}

const ICON_CLASS =
  'cursor-pointer fill-gray-600 hover:fill-gray-200 dark:fill-gray-400 dark:hover:fill-gray-100';

/**
 * A task card in List view. Until List view gets selection (slice N), the
 * card keeps its own always-visible action buttons.
 */
export const ListTaskItem: React.FC<ListTaskItemProps> = ({
  task,
  quadrantKey,
  editTaskAction,
  deleteTaskAction,
  completeTaskAction,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const status = useDeadlineStatus(task);

  const itemRef = useRef<HTMLLIElement | null>(null);
  useTaskFocusRequest(task.id, itemRef);

  const handleSave = (
    editText: string,
    deadline: Deadline | null,
    newQuadrant?: MatrixKey,
  ) => {
    editTaskAction(quadrantKey, task.id, editText, deadline, newQuadrant);
    setIsEditing(false);
  };

  return (
    <>
      <li
        ref={itemRef}
        tabIndex={-1}
        className={twMerge(
          'relative my-1 min-h-10 shrink-0 list-none rounded-md p-1',
          colors[quadrantKey],
          status === 'overdue' && OVERDUE_STRIPE_CLASS,
        )}
      >
        <div className="w-full p-2 text-center leading-5 text-black dark:text-gray-200">
          <Linkify text={task.text} />
        </div>

        <DeadlineLine
          task={task}
          status={status}
          className="mt-0 mb-1 justify-center px-2"
        />

        <div className="flex items-center justify-end border-t border-gray-500/30 px-1.5 pt-1 text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <button
              onClick={() => completeTaskAction(quadrantKey, task.id)}
              title="Mark as completed"
            >
              <CheckIcon className={ICON_CLASS} width="18px" height="18px" />
            </button>
            <button onClick={() => setIsEditing(true)} title="Edit task">
              <EditIcon className={ICON_CLASS} width="18px" height="18px" />
            </button>
            <button
              onClick={() => deleteTaskAction(quadrantKey, task.id)}
              title="Delete task"
            >
              <DeleteIcon className={ICON_CLASS} width="18px" height="18px" />
            </button>
          </div>
        </div>
      </li>

      {isEditing && (
        <EditTaskDialog
          task={task}
          quadrantKey={quadrantKey}
          onSave={handleSave}
          onClose={() => setIsEditing(false)}
        />
      )}
    </>
  );
};
