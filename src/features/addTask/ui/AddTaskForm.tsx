import { TaskPriority, TaskPriorityKey } from '@/entities/tasksMatrix';
import { useState } from 'react';
import { addTaskAction } from '@/entities/tasksMatrix';

export const AddTaskForm = () => {
  const [taskText, setTaskText] = useState('');
  const [selectedCategory, setSelectedCategory] =
    useState<TaskPriorityKey>('ImportantUrgent');

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
        className="w-full rounded border p-2"
      />
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value as TaskPriorityKey)}
        className="rounded border p-2"
      >
        {Object.entries(TaskPriority).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
      <button type="submit" className="rounded bg-blue-500 p-2 text-white">
        Add
      </button>
    </form>
  );
};
