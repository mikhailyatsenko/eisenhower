import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { Tasks } from '@/entities/Matrix/model/types/taskMatrixTypes';

const db = getFirestore();

export const fetchTasks = async (userId: string): Promise<Tasks> => {
  const tasks: Tasks = {
    ImportantUrgent: [],
    ImportantNotUrgent: [],
    NotImportantUrgent: [],
    NotImportantNotUrgent: [],
  };

  const q = query(collection(db, 'tasks'), where('userId', '==', userId));
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    tasks[data.quadrantKey].push({
      id: doc.id,
      text: data.text,
      createdAt: new Date(data.createdAt),
    });
  });

  return tasks;
};
