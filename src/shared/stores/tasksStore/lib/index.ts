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
import { Tasks, FirestoreTaskData } from '../types';

export const getEmptyTasksState = (): Tasks => {
  return MatrixQuadrantKeys.reduce<Tasks>((acc, quadrant) => {
    acc[quadrant as keyof Tasks] = [];
    return acc;
  }, {} as Tasks);
};

export const fetchTasksFromFirebase = async (): Promise<Tasks | null> => {
  try {
    const user = auth.currentUser;
    if (!user) return null;

    const tasksCollection = collection(db, 'tasks');
    const q = query(tasksCollection, where('userId', '==', user.uid));
    const tasksSnapshot = await getDocs(q);

    const tasksData: Tasks = getEmptyTasksState();

    tasksSnapshot.forEach((doc) => {
      const data = doc.data() as FirestoreTaskData;
      if (!data.quadrantKey) return;

      tasksData[data.quadrantKey].push({
        id: doc.id,
        text: data.text,
        createdAt: new Date(data.createdAt),
        order: data.order,
      });
    });

    Object.values(tasksData).forEach((tasks) =>
      tasks.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    );

    return tasksData;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return null;
  }
};

export const syncTasksToFirebase = async (tasks: Tasks) => {
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
        });
      });
    });

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
