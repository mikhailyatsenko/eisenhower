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

    dragOverQuadrant: (task, fromQuadrant, toQuadrant) =>
      set((state) => {
        const activeItems = state.tasks[fromQuadrant];
        const overItems = state.tasks[toQuadrant];

        const activeIndex = activeItems.findIndex((item) => item === task);

        if (activeIndex !== -1) {
          const [movedTask] = activeItems.splice(activeIndex, 1);
          overItems.push(movedTask);
        }
      }),

    dragEnd: (quadrantKey, startIndex, endIndex) =>
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

export const dragEndAction = (
  quadrantKey: MatrixKey,
  startIndex: number,
  endIndex: number,
) => {
  useTaskStore.getState().dragEnd(quadrantKey, startIndex, endIndex);
};

export const dragOverQuadrantAction = (
  task: string,
  fromQuadrant: MatrixKey,
  toQuadrant: MatrixKey,
) => {
  useTaskStore.getState().dragOverQuadrant(task, fromQuadrant, toQuadrant);
};
