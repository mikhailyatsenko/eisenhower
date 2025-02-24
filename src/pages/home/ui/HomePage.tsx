import { AddTask } from '@/features/addTask';
import { InteractWithMatrix } from '@/features/interactWithMatrix';
export const HomePage = () => {
  return (
    <div className="mx-auto w-5/6 p-6">
      <AddTask />
      <InteractWithMatrix />
    </div>
  );
};
