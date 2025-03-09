import {
  collection,
  getDocs,
  doc,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db, auth } from '@/shared/config/firebaseConfig';
import { Tasks, FirestoreTaskData, Task } from '../types/taskMatrixTypes';

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
    };
    tasksData[data.quadrantKey].push(task);
  });

  return tasksData;
};

export const syncTasksToFirebase = async (tasks: Tasks) => {
  const user = auth.currentUser;
  if (!user) return;

  const batch = writeBatch(db);
  for (const [key, taskList] of Object.entries(tasks)) {
    for (const task of taskList) {
      const taskRef = doc(db, 'tasks', task.id);
      batch.set(taskRef, {
        ...task,
        quadrantKey: key,
        userId: user.uid,
        createdAt: task.createdAt.toISOString(),
      });
    }
  }
  await batch.commit();
};
