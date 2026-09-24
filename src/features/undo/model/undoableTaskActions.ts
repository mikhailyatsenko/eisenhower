import { QUADRANTS } from '@/shared/consts';
import {
  MatrixKey,
  RESTORE_FALLBACK_QUADRANT,
  Task,
  completeTaskAction,
  deleteCompletedTaskAction,
  deleteTaskAction,
  restoreTaskAction,
} from '@/shared/stores/tasksStore';
import { performUndoable } from './performUndoable';

export const completeTask = (quadrantKey: MatrixKey, taskId: string) =>
  performUndoable({
    message: 'Task completed',
    perform: () => completeTaskAction(quadrantKey, taskId),
    focusTaskId: taskId,
  });

export const deleteTask = (quadrantKey: MatrixKey, taskId: string) =>
  performUndoable({
    message: 'Task deleted',
    perform: () => deleteTaskAction(quadrantKey, taskId),
    focusTaskId: taskId,
  });

export const deleteCompletedTask = (taskId: string) =>
  performUndoable({
    message: 'Task deleted',
    perform: () => deleteCompletedTaskAction(taskId),
    focusTaskId: taskId,
  });

export const restoreTask = (task: Task) => {
  const quadrantKey = task.quadrantKey ?? RESTORE_FALLBACK_QUADRANT;

  return performUndoable({
    message: `Restored to ${QUADRANTS[quadrantKey].title}`,
    perform: () => restoreTaskAction(task.id),
    focusTaskId: task.id,
  });
};
