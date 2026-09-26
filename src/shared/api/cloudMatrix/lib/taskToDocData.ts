import { TaskSetChange } from '../types';

/** The fields a `set` change writes to the task document */
export const taskToDocData = (
  { task, quadrantKey, order, completed }: TaskSetChange,
  userId: string,
) => ({
  text: task.text,
  quadrantKey,
  userId,
  createdAt: task.createdAt.toISOString(),
  dueDate: task.dueDate?.toISOString() ?? null,
  hasDueTime: task.dueDate ? (task.hasDueTime ?? true) : null,
  order,
  completed,
  ...(completed && {
    completedAt: (task.completedAt ?? new Date()).toISOString(),
  }),
});
