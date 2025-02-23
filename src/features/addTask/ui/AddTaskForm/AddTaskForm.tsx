'use client';

import { useEffect, useState } from 'react';
import { MatrixKey, MatrixQuadrants } from '@/entities/taskMatrix';
import { addTaskAction } from '@/entities/taskMatrix';
import { useTaskStore } from '@/entities/taskMatrix/model/store/tasksStore';
import { colors } from '../../lib/colors';

const useFormValidation = (taskText: string) => {
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setIsValid(taskText.length <= 200);
  }, [taskText]);

  return isValid;
};

export const AddTaskForm = () => {
  const setTaskText = useTaskStore((state) => state.setTaskText);
  const setSelectedCategory = useTaskStore(
    (state) => state.setSelectedCategory,
  );
  const selectedCategory = useTaskStore((state) => state.selectedCategory);
  const taskText = useTaskStore((state) => state.taskText);

  const isValid = useFormValidation(taskText);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = taskText.trim().length > 0;
    if (isValid) {
      addTaskAction(selectedCategory, taskText);
      setTaskText('');
    }
  };

  const handleCategoryChange = (key: MatrixKey) => {
    setSelectedCategory(key);
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
          onChange={(e) => setTaskText(e.target.value)}
          id="addTask"
          placeholder="Enter task"
          tabIndex={1}
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
