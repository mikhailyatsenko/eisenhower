import {
  collection,
  getDocs,
  doc,
  query,
  where,
  writeBatch,
  deleteDoc,
} from 'firebase/firestore';
import { db, auth } from '@/shared/config/firebaseConfig';
import { MatrixQuadrantKeys } from '../consts';
import { Tasks, Task, FirestoreTaskData } from '../types';

export const getEmptyTasksState = (): Tasks => {
  return MatrixQuadrantKeys.reduce<Tasks>((acc, quadrant) => {
    acc[quadrant as keyof Tasks] = [];
    return acc;
  }, {} as Tasks);
};

export const fetchTasksFromFirebase = async (): Promise<{
  tasks: Tasks;
  completedTasks: Task[];
} | null> => {
  try {
    const user = auth.currentUser;
    if (!user) return null;

    const tasksCollection = collection(db, 'tasks');
    const q = query(tasksCollection, where('userId', '==', user.uid));
    const tasksSnapshot = await getDocs(q);

    const tasksData: Tasks = getEmptyTasksState();
    const completedTasksData: Task[] = [];

    tasksSnapshot.forEach((doc) => {
      const data = doc.data() as FirestoreTaskData;

      const task = {
        id: doc.id,
        text: data.text,
        createdAt: new Date(data.createdAt),
        order: data.order,
        completed: data.completed,
        completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
        quadrantKey: data.quadrantKey,
      };

      if (data.completed) {
        completedTasksData.push(task);
      } else if (data.quadrantKey) {
        tasksData[data.quadrantKey].push(task);
      }
    });

    Object.values(tasksData).forEach((tasks) =>
      tasks.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    );

    completedTasksData.sort((a, b) => {
      const dateA = a.completedAt?.getTime() ?? 0;
      const dateB = b.completedAt?.getTime() ?? 0;
      return dateB - dateA; // Most recent first
    });

    return { tasks: tasksData, completedTasks: completedTasksData };
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return null;
  }
};

export const syncTasksToFirebase = async (
  tasks: Tasks,
  completedTasks?: Task[],
) => {
  try {
    const user = auth.currentUser;
    if (!user) return;

    const batch = writeBatch(db);

    Object.entries(tasks).forEach(([key, taskList]) => {
      taskList.forEach((task, index) => {
        const taskRef = doc(db, 'tasks', task.id);
        batch.set(taskRef, {
          text: task.text,
          quadrantKey: key,
          userId: user.uid,
          createdAt: task.createdAt.toISOString(),
          order: index,
          completed: false,
        });
      });
    });

    if (completedTasks) {
      completedTasks.forEach((task, index) => {
        const taskRef = doc(db, 'tasks', task.id);
        batch.set(taskRef, {
          text: task.text,
          quadrantKey: task.quadrantKey || 'NotImportantNotUrgent', // Default to Eliminate quadrant
          userId: user.uid,
          createdAt: task.createdAt.toISOString(),
          order: index,
          completed: true,
          completedAt:
            task.completedAt?.toISOString() || new Date().toISOString(),
        });
      });
    }

    await batch.commit();
  } catch (error) {
    console.error('Error syncing tasks:', error);
  }
};

export const deleteTaskFromFirebase = async (taskId: string) => {
  try {
    const user = auth.currentUser;
    if (!user) return;

    const taskRef = doc(db, 'tasks', taskId);
    await deleteDoc(taskRef);
  } catch (error) {
    console.error('Error deleting task:', error);
  }
};
