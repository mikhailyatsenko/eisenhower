'use client';

import { useState } from 'react';
import { MatrixKey, MatrixQuadrants } from '@/entities/taskMatrix';
import { addTaskAction } from '@/entities/taskMatrix';

const colors: Record<string, string> = {
  ImportantUrgent: 'peer-checked:bg-red-200 border-red-300',
  ImportantNotUrgent: 'peer-checked:bg-amber-200 border-amber-300',
  NotImportantUrgent: 'peer-checked:bg-blue-200 border-blue-300',
  NotImportantNotUrgent: 'peer-checked:bg-green-200 border-green-300',
};

export const AddTaskForm = () => {
  const [taskText, setTaskText] = useState('');
  const [selectedCategory, setSelectedCategory] =
    useState<MatrixKey>('ImportantUrgent');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskText.trim()) {
      addTaskAction(selectedCategory, taskText);
      setTaskText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 max-w-md gap-2">
      {/* <textarea
        value={taskText}
        onChange={(e) => setTaskText(e.target.value)}
        id="addTask"
        rows={2}
        placeholder="Enter task"
        className="w-full resize border-x-0 border-t-0 border-gray-200 px-0 align-top sm:text-sm"
      ></textarea> */}
      <div className="space-y-3">
        <textarea
          className="block w-full border-b-2 border-x-transparent border-t-transparent border-b-gray-200 bg-transparent px-0 py-3 text-sm focus:border-blue-500 focus:border-x-transparent focus:border-t-transparent focus:border-b-blue-500 focus:ring-0 focus-visible:outline-0 disabled:pointer-events-none disabled:opacity-50 dark:border-b-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:border-b-neutral-600 dark:focus:ring-neutral-600"
          rows={3}
          value={taskText}
          onChange={(e) => setTaskText(e.target.value)}
          id="addTask"
          placeholder="Enter task"
        ></textarea>
      </div>

      <div className="flex items-center justify-end gap-2 py-3">
        {Object.keys(MatrixQuadrants).map((key) => (
          <label key={key} className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="category"
              checked={selectedCategory === key}
              onChange={() => setSelectedCategory(key as MatrixKey)}
              key={key}
              value={key}
              className="peer hidden"
            />
            <span
              className={`h-5 w-5 rounded-full border-2 transition ${colors[key]}`}
            ></span>
          </label>
        ))}

        <button
          type="submit"
          className="rounded-sm bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Add
        </button>
      </div>
    </form>
  );
};
