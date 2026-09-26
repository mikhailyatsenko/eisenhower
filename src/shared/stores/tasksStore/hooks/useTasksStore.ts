import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { STORAGE_KEY } from '../consts';
import { getEmptyTasksState } from '../lib';
import { TaskState } from '../types';

const DATE_FIELDS = ['createdAt', 'dueDate', 'completedAt'];

// JSON turns Task dates into strings, so turn them back into Date on rehydration
const reviveTaskDates = (key: string, value: unknown) =>
  DATE_FIELDS.includes(key) && typeof value === 'string'
    ? new Date(value)
    : value;

export const useTaskStore = create<TaskState>()(
  persist(
    immer<TaskState>(() => ({
      localTasks: getEmptyTasksState(),
      firebaseTasks: getEmptyTasksState(),
      localCompletedTasks: [],
      firebaseCompletedTasks: [],
      isInCloud: false,
      isCloudLoaded: false,
    })),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage, {
        reviver: reviveTaskDates,
      }),
      partialize: (state) => ({
        localTasks: state.localTasks,
        localCompletedTasks: state.localCompletedTasks,
      }),
    },
  ),
);
