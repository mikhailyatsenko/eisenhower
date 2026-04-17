import { useEffect, useState } from 'react';
import { Task } from '@/shared/stores/tasksStore';
import { BUTTON_CANCEL_TEXT, BUTTON_SAVE_TEXT } from '../../consts';
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
    <form
      className="flex w-full flex-col"
      autoComplete="off"
      onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}
    >
      <input
        autoFocus
        type="text"
        value={editText}
        onChange={(e) => setEditText(e.target.value)}
        onKeyDown={handleKeyDown}
        className="mb-2 rounded-md px-3 py-1 text-gray-900 focus:outline-none dark:bg-gray-800 dark:text-gray-100"
      />
      {!isValid && (
        <p className="mb-1 text-xs text-red-900 dark:text-red-400">
          Task text must be between 1 and 200 characters.
        </p>
      )}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={handleCancel}
          className="h-fit cursor-pointer rounded-md border border-gray-500 px-2 py-2 text-sm font-bold leading-1 text-gray-600 hover:scale-[0.98] active:scale-[0.95] dark:text-gray-400"
          data-no-dnd="true"
        >
          {BUTTON_CANCEL_TEXT}
        </button>
        <button
          type="submit"
          className={`h-fit cursor-pointer rounded-md border border-gray-950 px-2 py-2 text-sm font-bold leading-1 text-gray-950 hover:scale-[0.98] active:scale-[0.95] dark:border-gray-400 dark:text-gray-200 ${!isValid ? 'pointer-events-none opacity-30' : ''}`}
          data-no-dnd="true"
          disabled={!isValid}
        >
          {BUTTON_SAVE_TEXT}
        </button>
      </div>
    </form>
  );
};
