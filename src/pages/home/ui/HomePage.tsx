'use client';

import { ToastContainer } from 'react-toastify';

import { TaskMatrix } from '@/widgets/taskMatrix';
import { AddTask } from '@/features/addTask';
import { CompletedTasksAccordion } from '@/entities/completedTasksAccordion';
import { showToastNotificationByAddTask } from '@/shared/lib/toastNotifications';
import {
  deleteCompletedTaskAction,
  restoreTaskAction,
  useTaskStore,
} from '@/shared/stores/tasksStore';
import { setRecentlyAddedQuadrantAction } from '@/shared/stores/uiStore';

export const HomePage = () => {
  const { activeState, localCompletedTasks, firebaseCompletedTasks } =
    useTaskStore();
  const completedTasks =
    activeState === 'local' ? localCompletedTasks : firebaseCompletedTasks;

  const handleRestoreTask = async (taskId: string) => {
    // Find the task to get its original quadrant
    const task = completedTasks.find((t) => t.id === taskId);
    if (task?.quadrantKey) {
      // Trigger animation on the original quadrant
      setRecentlyAddedQuadrantAction(task.quadrantKey);
      // Show toast notification
      showToastNotificationByAddTask(task.quadrantKey, true);
    }
    await restoreTaskAction(taskId);
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-0 h-10 w-1/2 translate-x-1/2 rounded-full blur-2xl transition-all duration-500 [background:_linear-gradient(45deg,_#ffd324,_#ff4f4f,_#9e71ff)] ${
          activeState === 'firebase'
            ? '-translate-y-1/2 opacity-100'
            : '-translate-y-full opacity-0'
        }`}
      ></div>
      <div className="relative z-[1] mx-auto w-[calc(100%-48px)] py-6 lg:w-5/6">
        {/* w-[calc(100%-48px)] because we have names of lines at the left with absolute position */}

        <AddTask />
        <TaskMatrix />

        <CompletedTasksAccordion
          completedTasks={completedTasks}
          onDeleteTask={deleteCompletedTaskAction}
          onRestoreTask={handleRestoreTask}
        />

        <ToastContainer />
      </div>
    </>
  );
};
