import { format } from 'date-fns';
import { useEffect, useRef, useState } from 'react';

import DeleteIcon from '@/shared/icons/delete-icon.svg';
import RestoreIcon from '@/shared/icons/restore-icon.svg';
import {
  MatrixKey,
  Task,
  clearAllCompletedTasksAction,
} from '@/shared/stores/tasksStore';
import { Linkify } from '@/shared/ui/linkify';
import { Loader } from '@/shared/ui/loader';

// Muted colors for completed tasks based on quadrant
const completedColors: Record<MatrixKey, string> = {
  ImportantUrgent: 'bg-red-200 dark:bg-red-900/40',
  ImportantNotUrgent: 'bg-yellow-200 dark:bg-yellow-800/40',
  NotImportantUrgent: 'bg-blue-200 dark:bg-blue-900/40',
  NotImportantNotUrgent: 'bg-green-200 dark:bg-green-900/40',
};

interface CompletedTaskItemProps {
  task: Task;
  onDelete: (taskId: string) => void;
  onRestore: (taskId: string) => void;
}

const CompletedTaskItem: React.FC<CompletedTaskItemProps> = ({
  task,
  onDelete,
  onRestore,
}) => {
  const [isCompletedHovered, setIsCompletedHovered] = useState(false);
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      window.confirm('Are you sure you want to permanently delete this task?')
    ) {
      onDelete(task.id);
    }
  };

  const handleRestore = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRestore(task.id);
  };

  const bgColor = task.quadrantKey
    ? completedColors[task.quadrantKey]
    : 'bg-gray-300 dark:bg-gray-700';

  return (
    <li
      className={`group relative my-1 min-h-10 shrink-0 list-none rounded-md p-1 text-gray-100 transition-transform hover:shadow-md dark:shadow-gray-600 ${bgColor} cursor-default`}
    >
      <div className="w-full p-2 text-center leading-5 text-black line-through opacity-70 dark:text-gray-200">
        <Linkify text={task.text} />
      </div>
      <div className="flex items-center justify-between border-t border-gray-500 px-1.5 pt-1 text-gray-600 dark:text-gray-400">
        {task.completedAt && (
          <p
            onMouseEnter={() => setIsCompletedHovered(true)}
            onMouseLeave={() => setIsCompletedHovered(false)}
            className="min-w-[224px] text-[0.7rem] font-bold italic sm:text-sm"
          >
            {isCompletedHovered
              ? `Created at ${format(task.createdAt, 'dd.MM.yyyy HH:mm')}`
              : `Completed at ${format(task.completedAt, 'dd.MM.yyyy HH:mm')}`}
          </p>
        )}
        <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100">
          <button onClick={handleRestore} title="Restore task">
            <RestoreIcon
              className="cursor-pointer fill-gray-600 hover:fill-gray-200 dark:fill-gray-400 dark:hover:fill-gray-100"
              width="18px"
              height="18px"
            />
          </button>
          <button onClick={handleDelete} title="Delete permanently">
            <DeleteIcon
              className="cursor-pointer fill-gray-600 hover:fill-gray-200 dark:fill-gray-400 dark:hover:fill-gray-100"
              width="18px"
              height="18px"
            />
          </button>
        </div>
      </div>
    </li>
  );
};

interface CompletedTasksAccordionProps {
  completedTasks: Task[];
  onDeleteTask: (taskId: string) => void;
  onRestoreTask: (taskId: string) => void;
}

export const CompletedTasksAccordion: React.FC<
  CompletedTasksAccordionProps
> = ({ completedTasks, onDeleteTask, onRestoreTask }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const accordionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && accordionRef.current) {
      accordionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    } else if (!isOpen) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }, [isOpen]);

  const handleClearAll = async () => {
    if (isDeleting) return;

    if (
      window.confirm(
        'Are you sure you want to permanently delete all completed tasks?',
      )
    ) {
      try {
        setIsDeleting(true);
        await clearAllCompletedTasksAction();
      } catch (error) {
        console.error('Failed to clear completed tasks:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClearAll();
    }
  };

  if (completedTasks.length === 0) {
    return null;
  }

  return (
    <div
      ref={accordionRef}
      id="completed-tasks-accordion"
      className="mx-auto mt-4 mb-28 w-full max-w-2xl"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-t-lg bg-gray-100 px-4 py-4 transition-colors hover:cursor-pointer hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
      >
        <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
          Completed Tasks ({completedTasks.length})
        </span>
        <svg
          className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="rounded-b-lg bg-gray-50 p-4 dark:bg-gray-900">
          <div className="mb-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>
              Click the restore button to move tasks back, or{' '}
              {isDeleting ? (
                <span className="inline-flex items-center font-bold text-red-600 dark:text-red-400">
                  clearing... <Loader className="ml-1 scale-50" />
                </span>
              ) : (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={handleClearAll}
                  onKeyDown={handleKeyDown}
                  className="cursor-pointer font-bold text-red-600 underline-offset-2 hover:underline focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none dark:text-red-400 dark:focus:ring-offset-gray-900"
                >
                  delete all
                </span>
              )}{' '}
              completed tasks.
            </span>
          </div>
          <ul className="space-y-2">
            {completedTasks.map((task) => (
              <CompletedTaskItem
                key={task.id}
                task={task}
                onDelete={onDeleteTask}
                onRestore={onRestoreTask}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
