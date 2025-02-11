'use client';

import { useState } from 'react';
import { MatrixKey, MatrixQuadrants } from '@/entities/taskMatrix';
import { addTaskAction } from '@/entities/taskMatrix';

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
    <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
      <input
        type="text"
        value={taskText}
        onChange={(e) => setTaskText(e.target.value)}
        placeholder="Enter task"
        className="w-full rounded-sm border p-2"
      />
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value as MatrixKey)}
        className="rounded-sm border p-2"
      >
        {Object.entries(MatrixQuadrants).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
      <button type="submit" className="rounded-sm bg-blue-500 p-2 text-white">
        Add
      </button>
    </form>
  );
};
