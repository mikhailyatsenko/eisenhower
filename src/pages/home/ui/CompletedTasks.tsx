'use client';

import { CompletedTasksAccordion } from '@/entities/completedTasksAccordion';
import {
  deleteCompletedTaskAction,
  restoreTaskAction,
  useTaskStore,
} from '@/shared/stores/tasksStore';
import { setRecentlyAddedQuadrantAction } from '@/shared/stores/uiStore';

export const CompletedTasks = () => {
  const { activeState, localCompletedTasks, firebaseCompletedTasks } =
    useTaskStore();
  const completedTasks =
    activeState === 'local' ? localCompletedTasks : firebaseCompletedTasks;

  const handleRestoreTask = async (taskId: string) => {
    // Find the task to get its original quadrant for animation
    const task = completedTasks.find((t) => t.id === taskId);
    if (task?.quadrantKey) {
      setRecentlyAddedQuadrantAction(task.quadrantKey);
    }
    await restoreTaskAction(taskId);
  };

  return (
    <CompletedTasksAccordion
      completedTasks={completedTasks}
      onDeleteTask={deleteCompletedTaskAction}
      onRestoreTask={handleRestoreTask}
    />
  );
};
