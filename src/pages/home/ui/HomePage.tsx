'use client';

import { useTaskStore } from '@/app/providers/zustand';
import { CategoryBlock } from '@/entities/categoryBlock';
import { QuadrantPriority } from '@/entities/categoryBlock/ui/CategoryBlock';
import { AddTaskForm } from '@/features/addTask';

export const HomePage = () => {
  const { tasks } = useTaskStore();

  return (
    <div className="mx-auto max-w-3xl p-6">
      <AddTaskForm />
      <div className="grid grid-cols-2 gap-4">
        {Object.values(QuadrantPriority).map((priority) => (
          <CategoryBlock
            key={priority}
            title={priority}
            priority={priority}
            tasks={tasks[priority]}
          />
        ))}
      </div>
    </div>
  );
};
