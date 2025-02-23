import { AddTaskForm } from '@/features/addTask';
import { TaskMatrix } from '@/features/interactWithMatrix';
export const HomePage = () => {
  return (
    <div className="mx-auto w-5/6 p-6">
      <AddTaskForm />
      <TaskMatrix />
    </div>
  );
};
