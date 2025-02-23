import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import DeleteIcon from '@/shared/icons/delete-icon.svg';
import EditIcon from '@/shared/icons/edit-icon.svg';
import { isTouchDevice } from '@/shared/utils/isTouchDevice';
import { deleteTaskAction, editTaskAction } from '../../model/store/tasksStore';
import { MatrixKey, Task } from '../../model/types/taskMatrixTypes';

interface TaskItemProps {
  task: Task;
  quadrantKey: MatrixKey;
  index: number;
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
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const [touchDevice, setTouchDevice] = useState(false);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setTouchDevice(isTouchDevice());
  }, []);

  useEffect(() => {
    setIsValid(editText.length > 0 && editText.length <= 200);
  }, [editText]);

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
      deleteTaskAction(quadrantKey, task.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) {
      editTaskAction(quadrantKey, task.id, editText);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditText(task.text);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValid) {
      handleSave(e);
    }
  };

  return (
    <li
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className={`relative my-1 p-1 ${isDragging ? 'opacity-50' : ''} min-h-10 ${colors[quadrantKey]} group ${!isEditing ? 'cursor-grab' : ''} list-none rounded-md text-gray-100 transition-transform hover:shadow-md dark:shadow-gray-600`}
    >
      {isEditing ? (
        <form
          className="flex w-full flex-col"
          autoComplete="off"
          onSubmit={handleSave}
        >
          <input
            autoFocus
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="mb-2 rounded-md px-3 py-1 text-gray-900"
          />
          {!isValid && (
            <p className="text-xs text-red-900">
              Task text must be between 1 and 200 characters.
            </p>
          )}
          <div className="flex justify-between">
            <button
              type="submit"
              onClick={handleSave}
              className={`z-30 text-green-600 ${!isValid ? 'cursor-not-allowed opacity-50' : ''}`}
              data-no-dnd="true"
              disabled={!isValid}
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="text-red-600"
              data-no-dnd="true"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="w-full p-2 text-center leading-5 text-black">
            {task.text}
          </div>
          <div className="flex items-center justify-between border-t border-gray-500 px-1.5 pt-1 text-gray-600">
            <p className="text-[0.7rem] font-bold italic sm:text-sm">
              {format(task.createdAt, 'dd.MM.yyyy HH:mm')}
            </p>

            <div
              className={`flex items-center gap-1 ${touchDevice ? '' : 'sm:opacity-0 sm:group-hover:opacity-100'}`}
            >
              <button onClick={handleEdit} className="" data-no-dnd="true">
                <EditIcon
                  className="cursor-pointer fill-gray-600 hover:fill-gray-200"
                  width="18px"
                  height="18px"
                />
              </button>
              <button onClick={handleDelete} data-no-dnd="true">
                <DeleteIcon
                  className="cursor-pointer fill-gray-600 hover:fill-gray-200"
                  width="18px"
                  height="18px"
                />
              </button>
            </div>
          </div>
        </>
      )}
    </li>
  );
};
