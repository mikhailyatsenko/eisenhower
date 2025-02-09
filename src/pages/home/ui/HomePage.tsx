import { AddTaskForm } from '@/features/addTask';
import { TaskMatrix } from '@/entities/taskMatrix';

export const HomePage = () => {
  return (
    <div className="mx-auto max-w-3xl p-6">
      <AddTaskForm />
      <TaskMatrix />
    </div>
  );
};
