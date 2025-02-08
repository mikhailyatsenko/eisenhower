import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { TaskState } from '../types/taskState';

export const useTaskStore = create<TaskState>()(
  immer((set) => ({
    tasks: {
      ImportantUrgent: [],
      ImportantNotUrgent: [],
      NotImportantUrgent: [],
      NotImportantNotUrgent: [],
    },
    addTask: (priority, task) =>
      set((state) => {
        state.tasks[priority].push(task);
      }),
  })),
);

export const addTaskAction = useTaskStore.getState().addTask;
