import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { MatrixKey } from '../types/quadrantTypes';
import { TaskState } from '../types/taskState';

export const useTaskStore = create<TaskState>()(
  immer((set) => ({
    tasks: {
      ImportantUrgent: [],
      ImportantNotUrgent: [],
      NotImportantUrgent: [],
      NotImportantNotUrgent: [],
    },
    selectedCategory: 'ImportantUrgent',
    taskText: '',

    setSelectedCategory: (category) => set({ selectedCategory: category }),
    setTaskText: (text) => set({ taskText: text }),

    addTask: (quadrantKey, task) =>
      set((state) => {
        state.tasks[quadrantKey].push(task);
      }),
    moveTaskToQuadrant: (task, fromQuadrant, toQuadrant) =>
      set((state) => {
        const newTasks = { ...state.tasks };
        newTasks[fromQuadrant] = newTasks[fromQuadrant].filter(
          (t) => t !== task,
        );
        newTasks[toQuadrant] = [...newTasks[toQuadrant], task];
        return { tasks: newTasks };
      }),
    reorderTasks: (quadrantKey, startIndex, endIndex) =>
      set((state) => {
        const newTasks = [...state.tasks[quadrantKey]];
        const [removed] = newTasks.splice(startIndex, 1);
        newTasks.splice(endIndex, 0, removed);
        state.tasks[quadrantKey] = newTasks;
      }),
  })),
);

export const addTaskAction = (quadrantKey: MatrixKey, task: string) => {
  useTaskStore.getState().addTask(quadrantKey, task);
};
export const moveTaskToQuadrantAction = (
  task: string,
  fromQuadrant: MatrixKey,
  toQuadrant: MatrixKey,
) => {
  useTaskStore.getState().moveTaskToQuadrant(task, fromQuadrant, toQuadrant);
};
export const reorderTasksAction = (
  quadrantKey: MatrixKey,
  startIndex: number,
  endIndex: number,
) => {
  useTaskStore.getState().reorderTasks(quadrantKey, startIndex, endIndex);
};
