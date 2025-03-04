import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { MatrixKey, Task, Tasks } from '../types/taskMatrixTypes';
import { setLoadingAction } from './uiStore';

export interface TaskState {
  tasks: Tasks;
}

const initialState: Tasks = {
  ImportantUrgent: [],
  ImportantNotUrgent: [],
  NotImportantUrgent: [],
  NotImportantNotUrgent: [],
};

export const useTaskStore = create<TaskState>()(
  persist(
    immer((set) => ({
      tasks: initialState,
      setTasks: (tasks: Tasks) =>
        set((state) => {
          state.tasks = tasks;
        }),
    })),
    {
      name: 'task-store',
      onRehydrateStorage: () => {
        setLoadingAction(false);
      },
    },
  ),
);

export const addTaskAction = (
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
    state.tasks[quadrantKey].push(newTask);
  });
};

export const editTaskAction = (
  quadrantKey: MatrixKey,
  taskId: string,
  newText: string,
) => {
  useTaskStore.setState((state) => {
    const task = state.tasks[quadrantKey].find((t) => t.id === taskId);
    if (task) task.text = newText;
  });
};

export const dragOverQuadrantAction = (
  taskId: string,
  fromQuadrant: MatrixKey,
  toQuadrant: MatrixKey,
) => {
  useTaskStore.setState((state) => {
    const activeItems = state.tasks[fromQuadrant];
    const overItems = state.tasks[toQuadrant];

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
    state.tasks = newTasks;
  });
};

export const deleteTaskAction = (quadrantKey: MatrixKey, taskId: string) => {
  useTaskStore.setState((state) => {
    state.tasks[quadrantKey] = state.tasks[quadrantKey].filter(
      (t: Task) => t.id !== taskId,
    );
  });
};
