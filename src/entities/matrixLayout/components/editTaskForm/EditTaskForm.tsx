import { useEffect, useState } from 'react';
import { Task } from '@/shared/stores/tasksStore';
interface EditFormProps {
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  task: Task;
  handleSave: (editText: string) => void;
}

export const EditTaskForm: React.FC<EditFormProps> = ({
  setIsEditing,
  task,
  handleSave,
}) => {
  const [editText, setEditText] = useState(task.text);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setIsValid(editText.length > 0 && editText.length <= 200);
  }, [editText]);

  const handleCancel = () => {
    setEditText(task.text);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValid) {
      onSave();
    }
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const onSave = () => {
    if (isValid) {
      handleSave(editText);
    }
  };

  return (
    <form className="flex w-full flex-col" autoComplete="off" onSubmit={onSave}>
      <input
        autoFocus
        type="text"
        value={editText}
        onChange={(e) => setEditText(e.target.value)}
        onKeyDown={handleKeyDown}
        className="mb-2 rounded-md px-3 py-1 text-gray-900"
      />
      {!isValid && (
        <p className="mb-1 text-xs text-red-900">
          Task text must be between 1 and 200 characters.
        </p>
      )}
      <div className="flex justify-between">
        <button
          onClick={handleCancel}
          className="h-fit cursor-pointer rounded-md border border-gray-500 px-2 py-2 text-sm leading-1 font-bold text-gray-600 hover:scale-[0.98] active:scale-[0.95]"
          data-no-dnd="true"
        >
          Cancel
        </button>
        <button
          type="submit"
          onClick={onSave}
          className={`h-fit cursor-pointer rounded-md border border-gray-950 px-2 py-2 text-sm leading-1 font-bold text-gray-950 hover:scale-[0.98] active:scale-[0.95] ${!isValid ? 'pointer-events-none opacity-30' : ''}`}
          data-no-dnd="true"
          disabled={!isValid}
        >
          Save
        </button>
      </div>
    </form>
  );
};
