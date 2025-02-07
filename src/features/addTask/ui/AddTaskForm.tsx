import { useTaskStore } from '@/app/providers/store/zustand';
import { QuadrantPriority, QuadrantPriorityKey } from '@/entities/quadrant';
import { useState } from 'react';

export const AddTaskForm = () => {
  const { addTask } = useTaskStore();
  const [taskText, setTaskText] = useState('');
  const [selectedCategory, setSelectedCategory] =
    useState<QuadrantPriorityKey>('ImportantUrgent');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskText.trim()) {
      addTask(selectedCategory, taskText);
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
        onChange={(e) =>
          setSelectedCategory(e.target.value as QuadrantPriorityKey)
        }
        className="rounded border p-2"
      >
        {Object.entries(QuadrantPriority).map(([key, label]) => (
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
