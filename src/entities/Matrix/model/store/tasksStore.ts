import {
  collection,
  getDocs,
  setDoc,
  doc,
  query,
  where,
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { db, auth } from '@/firebaseConfig';
import {
  MatrixKey,
  Task,
  Tasks,
  FirestoreTaskData,
} from '../types/taskMatrixTypes';
import { setLoadingAction } from './uiStore';

export interface TaskState {
  localTasks: Tasks;
  firebaseTasks: Tasks;
  activeState: 'local' | 'firebase';
}

const initialState: Tasks = {
  ImportantUrgent: [],
  ImportantNotUrgent: [],
  NotImportantUrgent: [],
  NotImportantNotUrgent: [],
};

const fetchTasksFromFirebase = async (): Promise<Tasks> => {
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

const syncTasksToFirebase = async (tasks: Tasks) => {
  const user = auth.currentUser;
  if (!user) return;

  for (const [key, taskList] of Object.entries(tasks)) {
    for (const task of taskList) {
      await setDoc(doc(db, 'tasks', task.id), {
        ...task,
        quadrantKey: key,
        userId: user.uid,
        createdAt: task.createdAt.toISOString(),
      });
    }
  }
};

export const useTaskStore = create<TaskState>()(
  persist(
    immer<TaskState>(() => ({
      localTasks: initialState,
      firebaseTasks: initialState,
      activeState: 'local',
    })),
    {
      name: 'task-store',
      partialize: (state) => ({ localTasks: state.localTasks }),
      onRehydrateStorage: () => {
        setLoadingAction(false);
      },
    },
  ),
);

export const syncTasks = async () => {
  const tasks = await fetchTasksFromFirebase();
  useTaskStore.setState((state) => {
    state.firebaseTasks = tasks;
  });
};

export const switchToLocalTasks = () => {
  useTaskStore.setState((state) => {
    state.activeState = 'local';
  });
};

export const switchToFirebaseTasks = () => {
  useTaskStore.setState((state) => {
    state.activeState = 'firebase';
  });
};

export const addTaskAction = async (
  quadrantKey: MatrixKey,
  taskInputText: string,
) => {
  useTaskStore.setState((state) => {
    if (taskInputText.length > 200) return;
    const newTask: Task = {
      id: uuidv4(),
      text: taskInputText,
      createdAt: new Date(),
    };
    if (state.activeState === 'local') {
      state.localTasks[quadrantKey].push(newTask);
    } else {
      state.firebaseTasks[quadrantKey].push(newTask);
    }
  });
  if (useTaskStore.getState().activeState === 'firebase') {
    await syncTasksToFirebase(useTaskStore.getState().firebaseTasks);
  }
};

export const editTaskAction = async (
  quadrantKey: MatrixKey,
  taskId: string,
  newText: string,
) => {
  useTaskStore.setState((state) => {
    const tasks =
      state.activeState === 'local' ? state.localTasks : state.firebaseTasks;
    const task = tasks[quadrantKey].find((t) => t.id === taskId);
    if (task) task.text = newText;
  });
  if (useTaskStore.getState().activeState === 'firebase') {
    await syncTasksToFirebase(useTaskStore.getState().firebaseTasks);
  }
};

export const dragOverQuadrantAction = (
  taskId: string,
  fromQuadrant: MatrixKey,
  toQuadrant: MatrixKey,
) => {
  useTaskStore.setState((state) => {
    const tasks =
      state.activeState === 'local' ? state.localTasks : state.firebaseTasks;
    const activeItems = tasks[fromQuadrant];
    const overItems = tasks[toQuadrant];

    const activeIndex = activeItems.findIndex(
      (item: Task) => item.id === taskId,
    );

    if (activeIndex !== -1) {
      const [movedTask] = activeItems.splice(activeIndex, 1);
      overItems.push(movedTask);
    }
  });
};

export const dragEndAction = (newTasks: Tasks) => {
  useTaskStore.setState((state) => {
    if (state.activeState === 'local') {
      state.localTasks = newTasks;
    } else {
      state.firebaseTasks = newTasks;
    }
  });
};

export const deleteTaskAction = async (
  quadrantKey: MatrixKey,
  taskId: string,
) => {
  useTaskStore.setState((state) => {
    const tasks =
      state.activeState === 'local' ? state.localTasks : state.firebaseTasks;
    tasks[quadrantKey] = tasks[quadrantKey].filter(
      (t: Task) => t.id !== taskId,
    );
  });
  if (useTaskStore.getState().activeState === 'firebase') {
    await syncTasksToFirebase(useTaskStore.getState().firebaseTasks);
  }
};
