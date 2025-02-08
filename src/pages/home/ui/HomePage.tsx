'use client';

import { AddTaskForm } from '@/features/addTask';
import { TasksMatrix } from '@/entities/tasksMatrix';

export const HomePage = () => {
  return (
    <div className="mx-auto max-w-3xl p-6">
      <AddTaskForm />
      <TasksMatrix />
    </div>
  );
};
