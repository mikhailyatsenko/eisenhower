import { TaskMatrix } from '@/widgets/taskMatrix';
import { AddTask } from '@/features/addTask';
import { ToastRegion } from '@/shared/ui/toast';
import { CompletedTasks } from './CompletedTasks';

// Server component: the h1 is in the HTML before hydration
export const HomePage = () => (
  <div className="relative z-[1] mx-auto w-[calc(100%-48px)] pt-4 pb-6 lg:w-5/6">
    {/* w-[calc(100%-48px)] because we have names of lines at the left with absolute position */}

    <h1 className="mb-4 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
      Eisenhower Matrix — prioritize tasks by urgency and importance
    </h1>
    <AddTask />
    <TaskMatrix />
    {/* Right after the matrix: Undo is the next Tab stop */}
    <ToastRegion />

    <CompletedTasks />
  </div>
);
