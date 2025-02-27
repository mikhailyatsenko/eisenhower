import { AddTask } from '@/features/addTask';
import { InteractWithMatrix } from '@/features/interactWithMatrix';
export const HomePage = () => {
  return (
    <div className="mx-auto w-[calc(100%-24px)] p-6 lg:w-5/6">
      {/* w-[calc(100%-24px)] because we have names of lines at the left with absolute position */}
      <AddTask />
      <InteractWithMatrix />
    </div>
  );
};
