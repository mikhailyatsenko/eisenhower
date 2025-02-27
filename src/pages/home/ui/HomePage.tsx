import { AddTask } from '@/features/addTask';
import { InteractWithMatrix } from '@/features/interactWithMatrix';
import Popup from '@/shared/ui/Popup';

export const HomePage = () => {
  return (
    <div className="mx-auto w-[calc(100%-48px)] pt-6 lg:w-5/6">
      {/* w-[calc(100%-48px)] because we have names of lines at the left with absolute position */}
      <Popup />
      <AddTask />
      <InteractWithMatrix />
    </div>
  );
};
