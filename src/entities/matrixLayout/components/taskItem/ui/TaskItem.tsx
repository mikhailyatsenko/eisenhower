import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';

import CheckIcon from '@/shared/icons/check-icon.svg';
import DeleteIcon from '@/shared/icons/delete-icon.svg';
import EditIcon from '@/shared/icons/edit-icon.svg';
import { MatrixKey } from '@/shared/stores/tasksStore';
import { Task } from '@/shared/stores/tasksStore';
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
  ) => void;
  completeTaskAction?: (quadrantKey: MatrixKey, taskId: string) => void;
  isCompleted?: boolean;
}

export const colors: Record<MatrixKey, string> = {
  ImportantUrgent: 'bg-red-300',
  ImportantNotUrgent: 'bg-amber-300',
  NotImportantUrgent: 'bg-blue-300',
  NotImportantNotUrgent: 'bg-green-300',
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
    setIsEditing(true);
  };

  const handleSave = (editText: string) => {
    if (editTaskAction && quadrantKey) {
      editTaskAction(quadrantKey, task.id, editText);
    }
    setIsEditing(false);
  };

  return (
    <li
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className={`relative my-1 p-1 ${isDragging ? 'opacity-50' : ''} min-h-10 ${quadrantKey ? colors[quadrantKey] : 'bg-gray-300'} group ${!isEditing ? 'cursor-grab' : ''} shrink-0 list-none rounded-md text-gray-100 transition-transform hover:shadow-md dark:shadow-gray-600`}
    >
      {isEditing ? (
        <EditTaskForm
          handleSave={handleSave}
          setIsEditing={setIsEditing}
          task={task}
        />
      ) : (
        <>
          <div
            className={`w-full p-2 text-center leading-5 text-black ${isCompleted ? 'line-through opacity-70' : ''}`}
          >
            {task.text}
          </div>
          <div className="flex items-center justify-between border-t border-gray-500 px-1.5 pt-1 text-gray-600">
            <p className="text-[0.7rem] font-bold italic sm:text-sm">
              {format(task.createdAt, 'dd.MM.yyyy HH:mm')}
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
                      className="cursor-pointer fill-gray-600 hover:fill-gray-200"
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
                      className="cursor-pointer fill-gray-600 hover:fill-gray-200"
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
                      className="cursor-pointer fill-gray-600 hover:fill-gray-200"
                      width="18px"
                      height="18px"
                    />
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </li>
  );
};
