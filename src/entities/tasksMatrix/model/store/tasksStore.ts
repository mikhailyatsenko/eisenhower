import { create } from 'zustand';
import { TaskState } from '../types/taskState';

export const useTaskStore = create<TaskState>((set) => ({
  task: {
    ImportantUrgent: [],
    ImportantNotUrgent: [],
    NotImportantUrgent: [],
    NotImportantNotUrgent: [],
  },
  addTask: (priority, task) => {
    return set((state) => ({
      task: {
        ...state.task,
        [priority]: [...state.task[priority], task],
      },
    }));
  },
}));

export const addTaskAction = useTaskStore.getState().addTask;
