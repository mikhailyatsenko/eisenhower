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
import {
  Tasks,
  FirestoreTaskData,
  Task,
  MatrixKey,
} from '../types/taskMatrixTypes';

const initialState: Tasks = {
  ImportantUrgent: [],
  ImportantNotUrgent: [],
  NotImportantUrgent: [],
  NotImportantNotUrgent: [],
};

export const fetchTasksFromFirebase = async (): Promise<Tasks> => {
  const user = auth.currentUser;
  if (!user) return initialState;

  const tasksCollection = collection(db, 'tasks');
  const q = query(tasksCollection, where('userId', '==', user.uid));
  const tasksSnapshot = await getDocs(q);

  const tasksData: Tasks = {
    ImportantUrgent: [],
    ImportantNotUrgent: [],
    NotImportantUrgent: [],
    NotImportantNotUrgent: [],
  };

  tasksSnapshot.forEach((doc) => {
    const data = doc.data() as FirestoreTaskData;
    const task: Task = {
      id: data.id,
      text: data.text,
      createdAt: new Date(data.createdAt),
      order: data.order,
    };
    tasksData[data.quadrantKey].push(task);
  });

  for (const key of Object.keys(tasksData)) {
    tasksData[key as MatrixKey].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }

  return tasksData;
};

export const syncTasksToFirebase = async (tasks: Tasks) => {
  const user = auth.currentUser;
  if (!user) return;

  const batch = writeBatch(db);
  for (const [key, taskList] of Object.entries(tasks)) {
    taskList.forEach((task, index) => {
      const taskRef = doc(db, 'tasks', task.id);
      batch.set(taskRef, {
        ...task,
        quadrantKey: key,
        userId: user.uid,
        createdAt: task.createdAt.toISOString(),
        order: index,
      });
    });
  }
  await batch.commit();
};

export const deleteTaskFromFirebase = async (taskId: string) => {
  const user = auth.currentUser;
  if (!user) return;

  const taskRef = doc(db, 'tasks', taskId);
  await deleteDoc(taskRef);
};
