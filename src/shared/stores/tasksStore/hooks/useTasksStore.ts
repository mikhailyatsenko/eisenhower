import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { STORAGE_KEY, DEFAULT_ACTIVE_STATE } from '../consts';
import { getEmptyTasksState } from '../lib';
import { TaskState } from '../types';

export const useTaskStore = create<TaskState>()(
  persist(
    immer<TaskState>(() => ({
      localTasks: getEmptyTasksState(),
      firebaseTasks: getEmptyTasksState(),
      activeState: DEFAULT_ACTIVE_STATE,
    })),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({ localTasks: state.localTasks }),
    },
  ),
);
