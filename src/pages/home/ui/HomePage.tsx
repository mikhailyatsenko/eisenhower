'use client';

import { useTaskStore } from '@/app/providers/store/zustand';
import {
  Quadrant,
  QuadrantPriority,
  QuadrantPriorityKey,
} from '@/entities/quadrant';
import { AddTaskForm } from '@/features/addTask';

export const HomePage = () => {
  const { tasks } = useTaskStore();

  console.log(tasks);

  return (
    <div className="mx-auto max-w-3xl p-6">
      <AddTaskForm />
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(QuadrantPriority).map(([key, label]) => (
          <Quadrant
            key={key}
            title={label}
            priority={key as QuadrantPriorityKey}
            tasks={tasks[key as QuadrantPriorityKey]}
          />
        ))}
      </div>
    </div>
  );
};
