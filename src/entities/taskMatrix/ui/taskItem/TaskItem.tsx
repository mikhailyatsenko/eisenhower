import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format } from 'date-fns';
import { useState } from 'react';
import DeleteIcon from '@/shared/icons/delete-icon.svg';
import EditIcon from '@/shared/icons/edit-icon.svg';
import { deleteTaskAction, editTaskAction } from '../../model/store/tasksStore';
import { MatrixKey, Task } from '../../model/types/quadrantTypes';

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
    console.log('edit');
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleSave = () => {
    editTaskAction(quadrantKey, task.id, editText);
    setIsEditing(false);
    console.log('save');
  };
  console.log(isEditing);

  const handleCancel = () => {
    setEditText(task.text);
    setIsEditing(false);
  };

  return (
    <li
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className={`relative my-1 p-1 ${isDragging ? 'opacity-0' : ''} min-h-10 ${colors[quadrantKey]} group cursor-grab list-none rounded-md text-gray-100 transition-transform hover:shadow-md dark:shadow-gray-600`}
    >
      {isEditing ? (
        <form className="flex w-full flex-col" onSubmit={handleSave}>
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="mb-2 rounded-md p-1 text-gray-900"
          />
          <div className="flex justify-between">
            <button
              type="submit"
              onMouseDown={handleSave}
              className="z-30 text-green-600"
            >
              Save
            </button>
            <button onMouseDown={handleCancel} className="text-red-600">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="w-full py-2 text-center leading-5 text-black">
            {task.text}
          </div>
          <div className="flex items-center justify-between border-t border-gray-500 px-1.5 pt-1 text-gray-600">
            <p className="text-sm font-bold italic">
              {format(task.createdAt, 'dd.MM.yyyy HH:mm')}
            </p>

            <div className="flex items-center gap-1">
              <button
                onMouseDown={handleEdit}
                className="opacity-0 group-hover:opacity-100"
              >
                <EditIcon
                  className="cursor-pointer fill-gray-600 hover:fill-gray-200"
                  width="18px"
                  height="18px"
                />
              </button>
              <button
                onMouseDown={handleDelete}
                className="opacity-0 group-hover:opacity-100"
              >
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
