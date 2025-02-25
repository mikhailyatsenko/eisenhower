import { AddTask } from '@/features/addTask';
import { InteractWithMatrix } from '@/features/interactWithMatrix';
export const HomePage = () => {
  return (
    <div className="mx-auto w-full p-6 sm:w-5/6">
      <AddTask />
      <InteractWithMatrix />
    </div>
  );
};
