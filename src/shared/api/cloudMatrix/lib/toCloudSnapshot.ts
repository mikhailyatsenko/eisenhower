import { MATRIX_KEYS } from '@/shared/consts';
import type { Task, Tasks } from '@/shared/stores/tasksStore';
import { CloudSnapshot, FirestoreTaskData } from '../types';

interface TaskDoc {
  id: string;
  data: FirestoreTaskData;
}

const taskFromDoc = ({ id, data }: TaskDoc): Task => ({
  id,
  text: data.text,
  createdAt: new Date(data.createdAt),
  dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
  hasDueTime: data.dueDate ? (data.hasDueTime ?? true) : undefined,
  order: data.order,
  completed: data.completed,
  completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
  quadrantKey: data.quadrantKey,
});

/** Lays the task documents out as a Matrix and Completed */
export const toCloudSnapshot = (
  docs: TaskDoc[],
  metadata: Pick<CloudSnapshot, 'fromCache' | 'hasPendingWrites'>,
): CloudSnapshot => {
  const tasks = Object.fromEntries(
    MATRIX_KEYS.map((key) => [key, [] as Task[]]),
  ) as Tasks;
  const completedTasks: Task[] = [];

  docs.forEach((doc) => {
    const task = taskFromDoc(doc);
    if (doc.data.completed) {
      completedTasks.push(task);
    } else if (doc.data.quadrantKey) {
      tasks[doc.data.quadrantKey].push(task);
    }
  });

  Object.values(tasks).forEach((quadrant) =>
    quadrant.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
  );
  completedTasks.sort(
    (a, b) => (b.completedAt?.getTime() ?? 0) - (a.completedAt?.getTime() ?? 0),
  );

  return { tasks, completedTasks, ...metadata };
};
