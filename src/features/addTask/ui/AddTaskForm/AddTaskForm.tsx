'use client';

import { useEffect, useState } from 'react';
import { MatrixKey, MatrixQuadrants } from '@/entities/taskMatrix';
import { addTaskAction } from '@/entities/taskMatrix';
import { useTaskStore } from '@/entities/taskMatrix/model/store/tasksStore';

const colors: Record<
  MatrixKey,
  { bg: string; hover: string; peerCheckedBg: string; border: string }
> = {
  ImportantUrgent: {
    bg: 'bg-red-300',
    hover: 'hover:bg-red-400',
    peerCheckedBg: 'peer-checked:bg-red-400',
    border: 'border-red-200',
  },
  ImportantNotUrgent: {
    bg: 'bg-amber-300',
    hover: 'hover:bg-amber-400',
    peerCheckedBg: 'peer-checked:bg-amber-400',
    border: 'border-amber-200',
  },
  NotImportantUrgent: {
    bg: 'bg-blue-300',
    hover: 'hover:bg-blue-400',
    peerCheckedBg: 'peer-checked:bg-blue-400',
    border: 'border-blue-200',
  },
  NotImportantNotUrgent: {
    bg: 'bg-green-300',
    hover: 'hover:bg-green-400',
    peerCheckedBg: 'peer-checked:bg-green-400',
    border: 'border-green-200',
  },
};

export const AddTaskForm = () => {
  const setTaskText = useTaskStore((state) => state.setTaskText); // Get the setter for task text
  const setSelectedCategory = useTaskStore(
    (state) => state.setSelectedCategory,
  ); // Get the setter for selected category
  const selectedCategory = useTaskStore((state) => state.selectedCategory); // Get the selected category
  const taskText = useTaskStore((state) => state.taskText); // Get the task text

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = taskText.trim().length > 0;
    setIsValid(isValid);
    if (isValid) {
      console.log(isValid);
      addTaskAction(selectedCategory, taskText);
      setTaskText('');
    }
  };

  const handleCategoryChange = (key: MatrixKey) => {
    setSelectedCategory(key); // Update the global store
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLSpanElement>,
    key: MatrixKey,
  ) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleCategoryChange(key);
    }
  };

  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setIsValid(taskText.length <= 200);
  }, [taskText]);

  return (
    <form
      onSubmit={handleSubmit}
      autoComplete="off"
      className="mx-auto mb-4 max-w-md gap-2"
    >
      <div className="space-y-3">
        <input
          className="block w-full border-b-2 border-x-transparent border-t-transparent border-b-gray-200 bg-transparent px-0 py-3 text-sm focus:border-blue-500 focus:border-x-transparent focus:border-t-transparent focus:border-b-blue-500 focus:ring-0 focus-visible:outline-0 disabled:pointer-events-none disabled:opacity-50 dark:border-b-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:border-b-neutral-600 dark:focus:ring-neutral-600"
          value={taskText}
          onChange={(e) => setTaskText(e.target.value)} // Update the global store
          id="addTask"
          placeholder="Enter task"
          tabIndex={1} // Set tabIndex for the input
        />
        {!isValid && (
          <p className="text-xs text-red-400">
            Task text must be between 1 and 200 characters.
          </p>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 py-3">
        {Object.keys(MatrixQuadrants).map((key, index) => (
          <label key={key} className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="category"
              checked={selectedCategory === key}
              onChange={() => handleCategoryChange(key as MatrixKey)}
              key={key}
              value={key}
              className="peer hidden"
            />
            <span
              tabIndex={index + 1}
              className={`h-5 w-5 rounded-full border-2 ${colors[key as MatrixKey].peerCheckedBg} ${colors[key as MatrixKey].border}`}
              onKeyDown={(e) => handleKeyDown(e, key as MatrixKey)}
            ></span>
          </label>
        ))}

        <button
          type="submit"
          disabled={!isValid}
          className={`${colors[selectedCategory].border} ${colors[selectedCategory].hover} text-foreground cursor-pointer rounded-sm border-2 px-3 py-1.5 text-sm font-medium hover:text-white disabled:opacity-50`}
          tabIndex={5}
        >
          Add task
        </button>
      </div>
    </form>
  );
};
