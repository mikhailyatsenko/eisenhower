import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { MatrixKey, Task, Tasks } from '../types/taskMatrixTypes';
import {
  fetchTasksFromFirebase,
  syncTasksToFirebase,
  deleteTaskFromFirebase,
} from './tasksFirebase';

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
  if (taskInputText.length > 200) return;
  const newTask: Task = {
    id: uuidv4(),
    text: taskInputText,
    createdAt: new Date(),
  };
  useTaskStore.setState((state) => {
    const tasks =
      state.activeState === 'local' ? state.localTasks : state.firebaseTasks;
    tasks[quadrantKey].push(newTask);
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

export const dragEndAction = async (newTasks: Tasks) => {
  const { activeState } = useTaskStore.getState();
  useTaskStore.setState((state) => {
    if (activeState === 'local') {
      state.localTasks = newTasks;
    } else {
      state.firebaseTasks = newTasks;
    }
  });

  if (activeState === 'firebase') {
    await syncTasksToFirebase(newTasks);
  }
};

export const deleteTaskAction = async (
  quadrantKey: MatrixKey,
  taskId: string,
) => {
  const { activeState } = useTaskStore.getState();
  useTaskStore.setState((state) => {
    const tasks =
      activeState === 'local' ? state.localTasks : state.firebaseTasks;
    tasks[quadrantKey] = tasks[quadrantKey].filter(
      (t: Task) => t.id !== taskId,
    );
  });
  if (activeState === 'firebase') {
    await deleteTaskFromFirebase(taskId);
  }
};
