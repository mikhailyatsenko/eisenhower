'use client';

import { deleteCompletedTask, restoreTask } from '@/features/undo';
import { CompletedTasksAccordion } from '@/entities/completedTasksAccordion';
import { selectCompletedTasks, useTaskStore } from '@/shared/stores/tasksStore';
import { setRecentlyAddedQuadrantAction } from '@/shared/stores/uiStore';

export const CompletedTasks = () => {
  const completedTasks = useTaskStore(selectCompletedTasks);

  const handleRestoreTask = async (taskId: string) => {
    // Find the task to get its original quadrant for animation
    const task = completedTasks.find((t) => t.id === taskId);
    if (!task) return;
    if (task.quadrantKey) {
      setRecentlyAddedQuadrantAction(task.quadrantKey);
    }
    await restoreTask(task);
  };

  return (
    <CompletedTasksAccordion
      completedTasks={completedTasks}
      onDeleteTask={deleteCompletedTask}
      onRestoreTask={handleRestoreTask}
    />
  );
};
