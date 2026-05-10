import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';

import CheckIcon from '@/shared/icons/check-icon.svg';
import DeleteIcon from '@/shared/icons/delete-icon.svg';
import EditIcon from '@/shared/icons/edit-icon.svg';
import { MatrixKey } from '@/shared/stores/tasksStore';
import { Task } from '@/shared/stores/tasksStore';
import { useUIStore } from '@/shared/stores/uiStore';
import { Linkify } from '@/shared/ui/linkify';
import { Modal } from '@/shared/ui/modal';
import { isTouchDevice } from '@/shared/utils/isTouchDevice';
import { EditTaskForm } from '../../editTaskForm';

interface TaskItemProps {
  task: Task;
  quadrantKey?: MatrixKey;
  index: number;
  deleteTaskAction?: (quadrantKey: MatrixKey, taskId: string) => void;
  editTaskAction?: (
    quadrantKey: MatrixKey,
    taskId: string,
    newText: string,
    newDueDate?: Date | null,
    newQuadrantKey?: MatrixKey,
  ) => void;
  completeTaskAction?: (quadrantKey: MatrixKey, taskId: string) => void;
  isCompleted?: boolean;
  disableDnd?: boolean;
}

export const colors: Record<MatrixKey, string> = {
  ImportantUrgent: 'bg-red-300 dark:bg-red-900/40',
  ImportantNotUrgent: 'bg-yellow-300/75 dark:bg-yellow-800/40',
  NotImportantUrgent: 'bg-blue-300 dark:bg-blue-900/40',
  NotImportantNotUrgent: 'bg-green-300/95 dark:bg-green-900/40',
};

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  quadrantKey,
  index,
  editTaskAction,
  deleteTaskAction,
  completeTaskAction,
  isCompleted = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentEditingQuadrant, setCurrentEditingQuadrant] = useState<
    MatrixKey | undefined
  >(quadrantKey);

  const [touchDevice, setTouchDevice] = useState(false);

  useEffect(() => {
    setTouchDevice(isTouchDevice());
  }, []);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { quadrantKey, index },
    disabled: isEditing,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this task?')) {
      if (deleteTaskAction && quadrantKey) {
        deleteTaskAction(quadrantKey, task.id);
      }
    }
  };

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (completeTaskAction && quadrantKey) {
      completeTaskAction(quadrantKey, task.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentEditingQuadrant(quadrantKey);
    setIsEditing(true);
  };

  const handleSave = (
    editText: string,
    dueDate: Date | null,
    newQuadrant?: MatrixKey,
  ) => {
    if (editTaskAction && quadrantKey) {
      editTaskAction(quadrantKey, task.id, editText, dueDate, newQuadrant);
    }
    setIsEditing(false);
  };

  const viewMode = useUIStore((state) => state.viewMode);

  const isOverdue =
    task.dueDate && !isCompleted && new Date() > new Date(task.dueDate);

  return (
    <>
      <li
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        style={style}
        className={`relative my-1 p-1 ${isDragging ? 'opacity-50' : ''} min-h-10 ${quadrantKey ? colors[quadrantKey] : 'bg-gray-300 dark:bg-gray-800'} group ${!isEditing && viewMode === 'matrix' ? 'cursor-grab' : ''} shrink-0 list-none rounded-md text-gray-100 transition-transform hover:shadow-md dark:shadow-gray-600 ${isOverdue ? 'ring-2 ring-red-500 ring-offset-1 dark:ring-offset-gray-900' : ''}`}
      >
        <div
          className={`w-full p-2 text-center leading-5 text-black dark:text-gray-200 ${isCompleted ? 'line-through opacity-70' : ''}`}
        >
          <Linkify text={task.text} />
        </div>

        {task.dueDate && (
          <div
            className={`mb-1 flex items-center justify-center gap-1 text-[10px] font-bold tracking-tight uppercase ${isOverdue ? 'text-red-700 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
            {isOverdue ? 'Overdue: ' : 'Due: '}
            {format(task.dueDate, 'dd/MM/yyyy HH:mm')}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-gray-500/30 px-1.5 pt-1 text-gray-600 dark:text-gray-400">
          <p className="text-[0.7rem] font-bold italic opacity-60 sm:text-xs">
            {format(task.createdAt, 'dd/MM/yyyy HH:mm')}
          </p>
          {(deleteTaskAction || editTaskAction || completeTaskAction) && (
            <div
              className={`flex items-center gap-2 ${touchDevice ? '' : 'sm:opacity-0 sm:group-hover:opacity-100'}`}
            >
              {!isCompleted && completeTaskAction && (
                <button
                  onClick={handleComplete}
                  className=""
                  data-no-dnd="true"
                  title="Mark as completed"
                >
                  <CheckIcon
                    className="cursor-pointer fill-gray-600 hover:fill-gray-200 dark:fill-gray-400 dark:hover:fill-gray-100"
                    width="18px"
                    height="18px"
                  />
                </button>
              )}
              {!isCompleted && editTaskAction && (
                <button
                  onClick={handleEdit}
                  className=""
                  data-no-dnd="true"
                  title="Edit task"
                >
                  <EditIcon
                    className="cursor-pointer fill-gray-600 hover:fill-gray-200 dark:fill-gray-400 dark:hover:fill-gray-100"
                    width="18px"
                    height="18px"
                  />
                </button>
              )}
              {deleteTaskAction && (
                <button
                  onClick={handleDelete}
                  data-no-dnd="true"
                  title="Delete task"
                >
                  <DeleteIcon
                    className="cursor-pointer fill-gray-600 hover:fill-gray-200 dark:fill-gray-400 dark:hover:fill-gray-100"
                    width="18px"
                    height="18px"
                  />
                </button>
              )}
            </div>
          )}
        </div>
      </li>

      {isEditing && (
        <Modal
          onClose={() => setIsEditing(false)}
          width="lg"
          className={`${currentEditingQuadrant ? colors[currentEditingQuadrant] : ''} border-none p-6 shadow-2xl transition-colors duration-300`}
        >
          <div className="flex h-fit max-h-[calc(100dvh-88px)] w-full flex-col overflow-hidden">
            <h3 className="mb-4 shrink-0 text-center text-lg font-bold tracking-widest text-gray-900 uppercase opacity-70 dark:text-gray-100">
              Edit Task
            </h3>
            <EditTaskForm
              handleSave={handleSave}
              setIsEditing={setIsEditing}
              task={task}
              onQuadrantChange={setCurrentEditingQuadrant}
            />
          </div>
        </Modal>
      )}
    </>
  );
};
